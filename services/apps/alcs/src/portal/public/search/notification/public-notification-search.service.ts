import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../../utils/search-helper';
import { NotificationParcel } from '../../../notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationTransferee } from '../../../notification-submission/notification-transferee/notification-transferee.entity';
import {
  AdvancedSearchResultDto,
  SearchRequestDto,
} from '../public-search.dto';
import { PublicNotificationSubmissionSearchView } from './public-notification-search-view.entity';

@Injectable()
export class PublicNotificationSearchService {
  constructor(
    @InjectRepository(PublicNotificationSubmissionSearchView)
    private notificationSearchViewRepo: Repository<PublicNotificationSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async search(
    searchDto: SearchRequestDto,
  ): Promise<
    AdvancedSearchResultDto<PublicNotificationSubmissionSearchView[]>
  > {
    let query = await this.compileNotificationSearchQuery(searchDto);

    query = this.compileGroupBySearchQuery(query);

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(sortQuery, searchDto.sortDirection)
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    const result = await query.getManyAndCount();

    return {
      data: result[0],
      total: result[1],
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

  private compileGroupBySearchQuery(query) {
    query = query
      .innerJoinAndMapOne(
        'notificationSearch.notificationType',
        'notificationSearch.notificationType',
        'notificationType',
      )
      .groupBy(
        `
          "notificationSearch"."uuid"
        , "notificationSearch"."notification_uuid"
        , "notificationSearch"."notification_region_code" 
        , "notificationSearch"."file_number"
        , "notificationSearch"."applicant"
        , "notificationSearch"."local_government_uuid"
        , "notificationSearch"."local_government_name"
        , "notificationSearch"."notification_type_code"
        , "notificationSearch"."status"
        , "notificationSearch"."date_submitted_to_alc"
        , "notificationType"."audit_deleted_date_at"
        , "notificationType"."audit_created_at"
        , "notificationType"."audit_updated_by"
        , "notificationType"."audit_updated_at"
        , "notificationType"."audit_created_by"
        , "notificationType"."short_label"
        , "notificationType"."label"
        , "notificationType"."code"
        , "notificationType"."html_description"
        , "notificationType"."portal_label"
        `,
      );
    return query;
  }

  private async compileNotificationSearchQuery(searchDto: SearchRequestDto) {
    let query =
      this.notificationSearchViewRepo.createQueryBuilder('notificationSearch');

    if (searchDto.fileNumber) {
      query = query
        .andWhere('notificationSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      query = query.andWhere(
        "alcs.get_current_status_for_notification_submission_by_uuid(notificationSearch.uuid) ->> 'status_type_code' IN(:...statuses)",
        {
          statuses: searchDto.portalStatusCodes,
        },
      );
    }

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query = query.andWhere(
        'notificationSearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      query = query.andWhere(
        'notificationSearch.notification_region_code IN(:...regions)',
        {
          regions: searchDto.regionCodes,
        },
      );
    }

    query = this.compileSearchByNameQuery(searchDto, query);
    query = this.compileParcelSearchQuery(searchDto, query);

    return query;
  }

  private compileParcelSearchQuery(searchDto: SearchRequestDto, query) {
    if (searchDto.pid || searchDto.civicAddress) {
      query = query.leftJoin(
        NotificationParcel,
        'parcel',
        'parcel.notification_submission_uuid = notificationSearch.uuid',
      );
    }

    if (searchDto.pid) {
      query = query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query = query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }
    return query;
  }

  private compileSearchByNameQuery(searchDto: SearchRequestDto, query) {
    if (searchDto.name) {
      const formattedSearchString =
        formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);

      query = query
        .leftJoin(
          NotificationTransferee,
          'notification_transferee',
          'notification_transferee.notification_submission_uuid = notificationSearch.uuid',
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
        );
    }
    return query;
  }
}
