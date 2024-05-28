import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Repository } from 'typeorm';
import { Notification } from '../../../alcs/notification/notification.entity';
import { SEARCH_CACHE_TIME } from '../../../alcs/search/search.config';
import { NOTIFICATION_SEARCH_FILTERS } from '../../../utils/search/notification-search-filters';
import { processSearchPromises } from '../../../utils/search/search-intersection';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { AdvancedSearchResultDto, InboxRequestDto } from '../inbox.dto';
import { InboxNotificationSubmissionView } from './inbox-notification-view.entity';

@Injectable()
export class InboxNotificationService {
  private logger: Logger = new Logger(InboxNotificationService.name);

  constructor(
    @InjectRepository(InboxNotificationSubmissionView)
    private notificationSearchViewRepo: Repository<InboxNotificationSubmissionView>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationSubmission)
    private notificationSubRepository: Repository<NotificationSubmission>,
    private redisService: RedisService,
  ) {}

  async search(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ): Promise<AdvancedSearchResultDto<InboxNotificationSubmissionView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_inbox_notification_${userUuid}_${searchHash}`;

    const client = this.redisService.getClient();
    const cachedSearch = await client.get(searchKey);

    let fileNumbers = new Set<string>();
    let didSearch = false;
    if (cachedSearch) {
      const cachedNumbers = JSON.parse(cachedSearch) as string[];
      fileNumbers = new Set<string>(cachedNumbers);
    } else {
      const res = await this.searchForFileNumbers(searchDto);
      fileNumbers = res.finalResult;
      didSearch = res.didSearch;
      if (didSearch) {
        await client.setEx(
          searchKey,
          SEARCH_CACHE_TIME,
          JSON.stringify([...fileNumbers.values()]),
        );
      }
    }

    if (didSearch && fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    const query = this.notificationSearchViewRepo
      .createQueryBuilder('notificationSearch')
      .innerJoinAndMapOne(
        'notificationSearch.notificationType',
        'notificationSearch.notificationType',
        'notificationType',
      )
      .orderBy(`("notificationSearch"."status" ->> 'effective_date')`, 'DESC')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    if (fileNumbers.size > 0) {
      query.andWhere('notificationSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers.values()],
      });
    }

    //User Permissions
    let where = 'notificationSearch.created_by_uuid = :userUuid';
    if (!searchDto.filterBy) {
      if (bceidBusinessGuid) {
        where +=
          ' OR notificationSearch.bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid) {
        where +=
          ' OR (notificationSearch.local_government_uuid = :governmentUuid AND notificationSearch.date_submitted_to_alc IS NOT NULL)';
      }
    } else {
      if (searchDto.filterBy === 'submitted') {
        where =
          'notificationSearch.local_government_uuid = :governmentUuid AND notificationSearch.date_submitted_to_alc IS NOT NULL';
      } else {
        where =
          '(notificationSearch.created_by_uuid = :userUuid OR notificationSearch.bceid_business_guid = :bceidBusinessGuid)';
      }
    }

    query.andWhere(`(${where})`, {
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    });

    const t0 = performance.now();
    const results = await Promise.all([query.getMany(), query.getCount()]);
    const t1 = performance.now();
    this.logger.debug(
      `Inbox Notification search took ${t1 - t0} milliseconds.`,
    );

    return {
      data: results[0],
      total: results[1],
    };
  }

  private async searchForFileNumbers(searchDto: InboxRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];
    let didSearch = false;

    if (searchDto.fileNumber) {
      didSearch = true;
      const promise = NOTIFICATION_SEARCH_FILTERS.addFileNumberResults(
        searchDto,
        this.notificationRepository,
      );
      promises.push(promise);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      didSearch = true;
      const promise = NOTIFICATION_SEARCH_FILTERS.addPortalStatusResults(
        searchDto,
        this.notificationSubRepository,
      );
      promises.push(promise);
    }

    if (searchDto.name) {
      didSearch = true;
      const promise = NOTIFICATION_SEARCH_FILTERS.addNameResults(
        searchDto,
        this.notificationSubRepository,
      );
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      didSearch = true;
      const promise = NOTIFICATION_SEARCH_FILTERS.addParcelResults(
        searchDto,
        this.notificationSubRepository,
      );
      promises.push(promise);
    }

    if (searchDto.fileTypes.includes('SRW')) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addFileTypeResults(
        searchDto,
        this.notificationRepository,
      );
      promises.push(promise);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(
      `Inbox Notification pre-search search took ${t1 - t0} milliseconds.`,
    );
    return { didSearch, finalResult };
  }
}
