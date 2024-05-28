import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { In, Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { Notification } from '../../../../alcs/notification/notification.entity';
import { NOTIFICATION_SEARCH_FILTERS } from '../../../../utils/search/notification-search-filters';
import { processSearchPromises } from '../../../../utils/search/search-intersection';
import { NotificationSubmission } from '../../../notification-submission/notification-submission.entity';
import {
  AdvancedSearchResultDto,
  SearchRequestDto,
} from '../public-search.dto';
import { PublicNotificationSubmissionSearchView } from './public-notification-search-view.entity';

@Injectable()
export class PublicNotificationSearchService {
  private logger: Logger = new Logger(PublicNotificationSearchService.name);

  constructor(
    @InjectRepository(PublicNotificationSubmissionSearchView)
    private notificationSearchRepo: Repository<PublicNotificationSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationSubmission)
    private notificationSubRepository: Repository<NotificationSubmission>,
    private redisService: RedisService,
  ) {}

  async search(
    searchDto: SearchRequestDto,
  ): Promise<
    AdvancedSearchResultDto<PublicNotificationSubmissionSearchView[]>
  > {
    const searchHash = hash(searchDto);
    const searchKey = `search_public_notification_${searchHash}`;

    const client = this.redisService.getClient();
    const cachedSearch = await client.get(searchKey);

    let fileNumbers = new Set<string>();
    if (cachedSearch) {
      const cachedNumbers = JSON.parse(cachedSearch) as string[];
      fileNumbers = new Set<string>(cachedNumbers);
    } else {
      fileNumbers = await this.searchForFileNumbers(searchDto);
      await client.setEx(
        searchKey,
        180,
        JSON.stringify([...fileNumbers.values()]),
      );
    }

    if (fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    let query = this.notificationSearchRepo
      .createQueryBuilder('notificationSearch')
      .andWhere('notificationSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers.values()],
      });

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(sortQuery, searchDto.sortDirection)
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    const t0 = performance.now();
    const results = await Promise.all([query.getMany(), query.getCount()]);
    const t1 = performance.now();
    this.logger.debug(
      `Notification public search took ${t1 - t0} milliseconds.`,
    );

    return {
      data: results[0],
      total: results[1],
    };
  }

  private compileSortQuery(searchDto: SearchRequestDto) {
    switch (searchDto.sortField) {
      case 'fileId':
        return '"notificationSearch"."file_number"';

      case 'ownerName':
        return '"notificationSearch"."applicant"';

      case 'type':
        return '"notificationSearch"."notification_type_code"';

      case 'government':
        return '"notificationSearch"."local_government_name"';

      case 'portalStatus':
        return `"notificationSearch"."status" ->> 'label' `;

      default:
      case 'lastUpdate':
        return `"notificationSearch"."status" ->> 'effective_date' `;
    }
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addFileNumberResults(
        searchDto,
        this.notificationRepository,
      );
      promises.push(promise);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addPortalStatusResults(
        searchDto,
        this.notificationSubRepository,
      );
      promises.push(promise);
    }

    if (searchDto.governmentName) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addGovernmentResults(
        searchDto,
        this.notificationRepository,
        this.governmentRepository,
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

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addNameResults(
        searchDto,
        this.notificationSubRepository,
      );
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addParcelResults(
        searchDto,
        this.notificationSubRepository,
      );
      promises.push(promise);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(
      `Notification pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addRegionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.notificationRepository.find({
      where: {
        regionCode: In(searchDto.regionCodes!),
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }
}
