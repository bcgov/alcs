import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, Repository } from 'typeorm';
import { Notification } from '../../../alcs/notification/notification.entity';
import { SEARCH_CACHE_TIME } from '../../../alcs/search/search.config';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { intersectSets } from '../../../utils/set-helper';
import { NotificationParcel } from '../../notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { NotificationTransferee } from '../../notification-submission/notification-transferee/notification-transferee.entity';
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
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      didSearch = true;
      this.addPortalStatusResults(searchDto, promises);
    }

    if (searchDto.name) {
      didSearch = true;
      this.addNameResults(searchDto, promises);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      didSearch = true;
      this.addParcelResults(searchDto, promises);
    }

    if (searchDto.fileTypes.length > 0) {
      didSearch = true;
      this.addFileTypeResults(searchDto, promises);
    }

    //Intersect Sets
    const t0 = performance.now();
    const queryResults = await Promise.all(promises);

    const allIds: Set<string>[] = [];
    for (const result of queryResults) {
      const fileNumbers = new Set<string>();
      result.forEach((currentValue) => {
        fileNumbers.add(currentValue.fileNumber);
      });
      allIds.push(fileNumbers);
    }

    const finalResult = intersectSets(allIds);

    const t1 = performance.now();
    this.logger.debug(
      `Inbox Notification pre-search search took ${t1 - t0} milliseconds.`,
    );
    return { didSearch, finalResult };
  }

  private addFileNumberResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.notificationRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private addPortalStatusResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.notificationSubRepository
      .createQueryBuilder('notiSub')
      .select('notiSub.fileNumber')
      .where(
        "alcs.get_current_status_for_notification_submission_by_uuid(notiSub.uuid) ->> 'status_type_code' IN(:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
    promises.push(promise);
  }

  private addNameResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const formattedSearchString =
      formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);
    const promise = this.notificationSubRepository
      .createQueryBuilder('notiSub')
      .select('notiSub.fileNumber')
      .leftJoin(
        NotificationTransferee,
        'notification_transferee',
        'notification_transferee.notification_submission_uuid = notiSub.uuid',
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where(
              "LOWER(notification_transferee.first_name || ' ' || notification_transferee.last_name) LIKE ANY (:names)",
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notification_transferee.first_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notification_transferee.last_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notification_transferee.organization_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            ),
        ),
      )
      .getMany();
    promises.push(promise);
  }

  private addParcelResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.notificationSubRepository
      .createQueryBuilder('notiSub')
      .select('notiSub.fileNumber')
      .leftJoin(
        NotificationParcel,
        'parcel',
        'parcel.notification_submission_uuid = notiSub.uuid',
      );

    if (searchDto.pid) {
      query = query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query = query.andWhere(
        'LOWER(parcel.civic_address) like LOWER(:civic_address)',
        {
          civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
        },
      );
    }

    promises.push(query.getMany());
  }

  private addFileTypeResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    if (searchDto.fileTypes.includes('SRW')) {
      const query = this.notificationRepository.find({
        select: {
          fileNumber: true,
        },
      });
      promises.push(query);
    }
  }
}
