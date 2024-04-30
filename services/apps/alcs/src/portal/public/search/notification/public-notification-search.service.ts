import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, In, Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { Notification } from '../../../../alcs/notification/notification.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../../utils/search-helper';
import { intersectSets } from '../../../../utils/set-helper';
import { NotificationParcel } from '../../../notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationSubmission } from '../../../notification-submission/notification-submission.entity';
import { NotificationTransferee } from '../../../notification-submission/notification-transferee/notification-transferee.entity';
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
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      this.addPortalStatusResults(searchDto, promises);
    }

    if (searchDto.governmentName) {
      await this.addGovernmentResults(searchDto, promises);
    }

    if (searchDto.fileTypes) {
      this.addFileTypeResults(searchDto, promises);
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      this.addNameResults(searchDto, promises);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      this.addParcelResults(searchDto, promises);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      this.addParcelResults(searchDto, promises);
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
      `Notification pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addFileNumberResults(
    searchDto: SearchRequestDto,
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
    searchDto: SearchRequestDto,
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

  private async addGovernmentResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const government = await this.governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    const promise = this.notificationRepository.find({
      where: {
        localGovernmentUuid: government.uuid,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
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

  private addNameResults(
    searchDto: SearchRequestDto,
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
    searchDto: SearchRequestDto,
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
    searchDto: SearchRequestDto,
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
