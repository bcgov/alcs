import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { QueryRunner, Repository } from 'typeorm';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NOTIFICATION_SEARCH_FILTERS } from '../../../utils/search/notification-search-filters';
import { processSearchPromises } from '../../../utils/search/search-intersection';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { Notification } from '../../notification/notification.entity';
import { SEARCH_CACHE_TIME } from '../search.config';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { NotificationSubmissionSearchView } from './notification-search-view.entity';

@Injectable()
export class NotificationAdvancedSearchService {
  private logger: Logger = new Logger(NotificationAdvancedSearchService.name);

  constructor(
    @InjectRepository(NotificationSubmissionSearchView)
    private notificationSearchRepository: Repository<NotificationSubmissionSearchView>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationSubmission)
    private notificationSubRepository: Repository<NotificationSubmission>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async search(
    searchDto: SearchRequestDto,
    queryRunner: QueryRunner,
  ): Promise<AdvancedSearchResultDto<NotificationSubmissionSearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_alcs_notification_${searchHash}`;

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
        SEARCH_CACHE_TIME,
        JSON.stringify([...fileNumbers.values()]),
      );
    }

    if (fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    let query = this.notificationSearchRepository
      .createQueryBuilder('notificationSearch', queryRunner)
      .innerJoinAndMapOne(
        'notificationSearch.notificationType',
        'notificationSearch.notificationType',
        'notificationType',
      )
      .andWhere('notificationSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers.values()],
      });

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(
        sortQuery,
        searchDto.sortDirection,
        searchDto.sortDirection === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST',
      )
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    const t0 = performance.now();
    const results = await Promise.all([query.getMany(), query.getCount()]);
    const t1 = performance.now();
    this.logger.debug(`Notification ALCS search took ${t1 - t0} milliseconds.`);

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
      case 'dateSubmitted':
        return '"notificationSearch"."date_submitted_to_alc"';
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

    if (searchDto.regionCode) {
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

    if (searchDto.fileTypes.includes('SRW')) {
      const promise = NOTIFICATION_SEARCH_FILTERS.addFileTypeResults(
        searchDto,
        this.notificationRepository,
      );
      promises.push(promise);
    }

    if (searchDto.dateSubmittedFrom || searchDto.dateSubmittedTo) {
      this.addSubmittedDateResults(searchDto, promises);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(
      `ALCS Application pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addRegionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.notificationRepository.find({
      where: {
        regionCode: searchDto.regionCode,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private addSubmittedDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.fileNumber');

    if (searchDto.dateSubmittedFrom !== undefined) {
      query = query.andWhere(
        'notification.date_submitted_to_alc >= :date_submitted_from',
        {
          date_submitted_from: new Date(searchDto.dateSubmittedFrom),
        },
      );
    }

    if (searchDto.dateSubmittedTo !== undefined) {
      query = query.andWhere(
        'notification.date_submitted_to_alc <= :date_submitted_to',
        {
          date_submitted_to: new Date(searchDto.dateSubmittedTo),
        },
      );
    }
    promises.push(query.getMany());
  }
}
