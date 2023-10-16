import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { NoticeOfIntentDecision } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { NoticeOfIntentOwner } from '../../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { AdvancedSearchResultDto, InboxRequestDto } from '../inbox.dto';
import { InboxNoticeOfIntentSubmissionView } from './inbox-notice-of-intent-view.entity';

@Injectable()
export class InboxNoticeOfIntentService {
  constructor(
    @InjectRepository(InboxNoticeOfIntentSubmissionView)
    private noiSearchRepository: Repository<InboxNoticeOfIntentSubmissionView>,
  ) {}

  async searchNoticeOfIntents(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ): Promise<AdvancedSearchResultDto<InboxNoticeOfIntentSubmissionView[]>> {
    const query = await this.compileNoticeOfIntentSearchQuery(
      searchDto,
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    );

    this.compileGroupBySearchQuery(query);

    query
      .orderBy('"noiSearch"."last_update"', 'DESC')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    const result = await query.getManyAndCount();

    return {
      data: result[0],
      total: result[1],
    };
  }

  private compileGroupBySearchQuery(query) {
    query = query
      .innerJoinAndMapOne(
        'noiSearch.noticeOfIntentType',
        'noiSearch.noticeOfIntentType',
        'noticeOfIntentType',
      )
      .groupBy(
        `
          "noiSearch"."uuid"
        , "noiSearch"."notice_of_intent_uuid"
        , "noiSearch"."file_number"
        , "noiSearch"."applicant"
        , "noiSearch"."local_government_uuid"
        , "noiSearch"."notice_of_intent_type_code"
        , "noiSearch"."status"
        , "noiSearch"."created_at"
        , "noiSearch"."last_update"
        , "noiSearch"."created_by_uuid"
        , "noiSearch"."bceid_business_guid"      
        , "noticeOfIntentType"."audit_deleted_date_at"
        , "noticeOfIntentType"."audit_created_at"
        , "noticeOfIntentType"."audit_updated_by"
        , "noticeOfIntentType"."audit_updated_at"
        , "noticeOfIntentType"."audit_created_by"
        , "noticeOfIntentType"."short_label"
        , "noticeOfIntentType"."label"
        , "noticeOfIntentType"."code"
        , "noticeOfIntentType"."html_description"
        , "noticeOfIntentType"."portal_label"
        `,
      );
    return query;
  }

  private async compileNoticeOfIntentSearchQuery(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ) {
    const query = this.noiSearchRepository.createQueryBuilder('noiSearch');

    //User Permissions
    let where = 'noiSearch.created_by_uuid = :userUuid';
    if (!searchDto.filterBy) {
      if (bceidBusinessGuid) {
        where += ' OR noiSearch.bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid) {
        where += ' OR noiSearch.local_government_uuid = :governmentUuid';
      }
    } else {
      if (searchDto.filterBy === 'submitted') {
        where = 'noiSearch.local_government_uuid = :governmentUuid';
      } else {
        where =
          '(noiSearch.created_by_uuid = :userUuid OR noiSearch.bceid_business_guid = :bceidBusinessGuid)';
      }
    }
    query.andWhere(`(${where})`, {
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    });

    if (searchDto.fileNumber) {
      query
        .andWhere('noiSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      query.andWhere(
        "alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noiSearch.uuid) ->> 'status_type_code' IN(:...statuses)",
        {
          statuses: searchDto.portalStatusCodes,
        },
      );
    }

    this.compileSearchByNameQuery(searchDto, query);
    this.compileParcelSearchQuery(searchDto, query);

    return query;
  }

  private joinDecision(query: any) {
    query = query.leftJoin(
      NoticeOfIntentDecision,
      'decision',
      'decision.notice_of_intent_uuid = "noiSearch"."notice_of_intent_uuid"',
    );
    return query;
  }

  private compileParcelSearchQuery(searchDto: InboxRequestDto, query) {
    if (searchDto.pid || searchDto.civicAddress) {
      query = query.leftJoin(
        NoticeOfIntentParcel,
        'parcel',
        'parcel.notice_of_intent_submission_uuid = noiSearch.uuid',
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
          NoticeOfIntentOwner,
          'notice_of_intent_owner',
          'notice_of_intent_owner.notice_of_intent_submission_uuid = noiSearch.uuid',
        )
        .andWhere(
          new Brackets((qb) =>
            qb
              .where(
                "LOWER(notice_of_intent_owner.first_name || ' ' || notice_of_intent_owner.last_name) LIKE ANY (:names)",
                {
                  names: formattedSearchString,
                },
              )
              .orWhere(
                'LOWER(notice_of_intent_owner.first_name) LIKE ANY (:names)',
                {
                  names: formattedSearchString,
                },
              )
              .orWhere(
                'LOWER(notice_of_intent_owner.last_name) LIKE ANY (:names)',
                {
                  names: formattedSearchString,
                },
              )
              .orWhere(
                'LOWER(notice_of_intent_owner.organization_name) LIKE ANY (:names)',
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
