import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { NotificationParcel } from '../../notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationTransferee } from '../../notification-submission/notification-transferee/notification-transferee.entity';
import { AdvancedSearchResultDto, InboxRequestDto } from '../inbox.dto';
import { InboxNotificationSubmissionView } from './inbox-notification-view.entity';

@Injectable()
export class InboxNotificationService {
  constructor(
    @InjectRepository(InboxNotificationSubmissionView)
    private notificationSearchViewRepo: Repository<InboxNotificationSubmissionView>,
  ) {}

  async search(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ): Promise<AdvancedSearchResultDto<InboxNotificationSubmissionView[]>> {
    let query = await this.compileNotificationSearchQuery(
      searchDto,
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    );

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

  private compileSortQuery(searchDto: InboxRequestDto) {
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
        return `"notificationSearch"."status" ->> 'effectiveDate' `;
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
        , "notificationSearch"."file_number"
        , "notificationSearch"."applicant"
        , "notificationSearch"."created_at"
        , "notificationSearch"."local_government_uuid"
        , "notificationSearch"."notification_type_code"
        , "notificationSearch"."status"
        , "notificationSearch"."created_by_uuid"
        , "notificationSearch"."bceid_business_guid"
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

  private async compileNotificationSearchQuery(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ) {
    let query =
      this.notificationSearchViewRepo.createQueryBuilder('notificationSearch');

    //User Permissions
    let where = 'notificationSearch.created_by_uuid = :userUuid';
    if (!searchDto.filterBy) {
      if (bceidBusinessGuid) {
        where +=
          ' OR notificationSearch.bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid) {
        where +=
          ' OR notificationSearch.local_government_uuid = :governmentUuid';
      }
    } else {
      if (searchDto.filterBy === 'submitted') {
        where = 'notificationSearch.local_government_uuid = :governmentUuid';
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

    query = this.compileSearchByNameQuery(searchDto, query);
    query = this.compileParcelSearchQuery(searchDto, query);

    return query;
  }

  private compileParcelSearchQuery(searchDto: InboxRequestDto, query) {
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
      query = query.andWhere('parcel.civic_address like :civic_address', {
        civic_address: `%${searchDto.civicAddress}%`,
      });
    }
    return query;
  }

  private compileSearchByNameQuery(searchDto: InboxRequestDto, query) {
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
