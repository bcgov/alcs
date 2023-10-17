import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { NoticeOfIntentOwner } from '../../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
} from '../../../utils/pacific-date-time-helper';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision/notice-of-intent-decision.entity';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent-search-view.entity';

@Injectable()
export class NoticeOfIntentAdvancedSearchService {
  constructor(
    @InjectRepository(NoticeOfIntentSubmissionSearchView)
    private noiSearchRepository: Repository<NoticeOfIntentSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async searchNoticeOfIntents(
    searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentSubmissionSearchView[]>> {
    let query = await this.compileNoticeOfIntentSearchQuery(searchDto);

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
        return '"noiSearch"."file_number"';

      case 'ownerName':
        return '"noiSearch"."applicant"';

      case 'type':
        return '"noiSearch"."notice_of_intent_type_code"';

      case 'government':
        return '"noiSearch"."local_government_name"';

      case 'portalStatus':
        return `"noiSearch"."status" ->> 'label' `;

      default:
      case 'dateSubmitted':
        return '"noiSearch"."date_submitted_to_alc"';
    }
  }

  private compileGroupBySearchQuery(
    query: SelectQueryBuilder<NoticeOfIntentSubmissionSearchView>,
  ) {
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
        , "noiSearch"."notice_of_intent_region_code" 
        , "noiSearch"."file_number"
        , "noiSearch"."applicant"
        , "noiSearch"."local_government_uuid"
        , "noiSearch"."local_government_name"
        , "noiSearch"."notice_of_intent_type_code"
        , "noiSearch"."status"
        , "noiSearch"."date_submitted_to_alc"
        , "noiSearch"."decision_date"
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
        , "noiSearch"."is_draft"
        `,
      );
    return query;
  }

  private async compileNoticeOfIntentSearchQuery(searchDto: SearchRequestDto) {
    let query = this.noiSearchRepository
      .createQueryBuilder('noiSearch')
      .where('noiSearch.is_draft = false');

    if (searchDto.fileNumber) {
      query = query
        .andWhere('noiSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.portalStatusCode) {
      query = query.andWhere(
        "alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noiSearch.uuid) ->> 'status_type_code' = :status",
        {
          status: searchDto.portalStatusCode,
        },
      );
    }

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query = query.andWhere(
        'noiSearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.regionCode) {
      query = query.andWhere(
        'noiSearch.notice_of_intent_region_code = :noi_region_code',
        {
          noi_region_code: searchDto.regionCode,
        },
      );
    }

    query = this.compileSearchByNameQuery(searchDto, query);

    query = this.compileParcelSearchQuery(searchDto, query);

    query = this.compileDecisionSearchQuery(searchDto, query);

    query = this.compileDateRangeSearchQuery(searchDto, query);

    return query;
  }

  private compileDateRangeSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<NoticeOfIntentSubmissionSearchView>,
  ) {
    // TODO check dates toIsoString
    if (searchDto.dateSubmittedFrom) {
      query = query.andWhere(
        'noiSearch.date_submitted_to_alc >= :date_submitted_from_alc',
        {
          date_submitted_from_alc: getStartOfDayToPacific(
            searchDto.dateSubmittedFrom,
          ).toISOString(),
        },
      );
    }

    if (searchDto.dateSubmittedTo) {
      query = query.andWhere(
        'noiSearch.date_submitted_to_alc < :date_submitted_to_alc',
        {
          date_submitted_to_alc: getNextDayToPacific(
            searchDto.dateSubmittedTo,
          ).toISOString(),
        },
      );
    }

    if (searchDto.dateDecidedFrom) {
      query = query.andWhere('noiSearch.decision_date >= :decision_date', {
        decision_date: getStartOfDayToPacific(
          searchDto.dateDecidedFrom,
        ).toISOString(),
      });
    }

    if (searchDto.dateDecidedTo) {
      query = query.andWhere('noiSearch.decision_date < :decision_date_to', {
        decision_date_to: getNextDayToPacific(
          searchDto.dateDecidedTo,
        ).toISOString(),
      });
    }
    return query;
  }

  private compileDecisionSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<NoticeOfIntentSubmissionSearchView>,
  ) {
    if (
      searchDto.resolutionNumber !== undefined ||
      searchDto.resolutionYear !== undefined
    ) {
      query = this.joinDecision(query);

      if (searchDto.resolutionNumber !== undefined) {
        query = query.andWhere(
          'decision.resolution_number = :resolution_number AND decision.is_draft = false',
          {
            resolution_number: searchDto.resolutionNumber,
          },
        );
      }

      if (searchDto.resolutionYear !== undefined) {
        query = query.andWhere('decision.resolution_year = :resolution_year', {
          resolution_year: searchDto.resolutionYear,
        });
      }
    }
    return query;
  }

  private joinDecision(query: any) {
    query = query.leftJoin(
      NoticeOfIntentDecision,
      'decision',
      'decision.notice_of_intent_uuid = "noiSearch"."notice_of_intent_uuid" AND decision.is_draft = false',
    );
    return query;
  }

  private compileParcelSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<NoticeOfIntentSubmissionSearchView>,
  ) {
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
      query = query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }
    return query;
  }

  private compileSearchByNameQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<NoticeOfIntentSubmissionSearchView>,
  ) {
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
