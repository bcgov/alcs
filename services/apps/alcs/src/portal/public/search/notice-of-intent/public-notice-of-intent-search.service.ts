import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../../utils/search-helper';
import { NoticeOfIntentOwner } from '../../../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import {
  AdvancedSearchResultDto,
  SearchRequestDto,
} from '../public-search.dto';
import { PublicNoticeOfIntentSubmissionSearchView } from './public-notice-of-intent-search-view.entity';

@Injectable()
export class PublicNoticeOfIntentSearchService {
  constructor(
    @InjectRepository(PublicNoticeOfIntentSubmissionSearchView)
    private noiSearchRepository: Repository<PublicNoticeOfIntentSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async searchNoticeOfIntents(
    searchDto: SearchRequestDto,
  ): Promise<
    AdvancedSearchResultDto<PublicNoticeOfIntentSubmissionSearchView[]>
  > {
    const query = await this.compileNoticeOfIntentSearchQuery(searchDto);

    this.compileGroupBySearchQuery(query);

    const sortQuery = this.compileSortQuery(searchDto);

    query
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
      case 'lastUpdate':
        return '"noiSearch"."last_update"';
    }
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
        , "noiSearch"."notice_of_intent_region_code" 
        , "noiSearch"."file_number"
        , "noiSearch"."applicant"
        , "noiSearch"."local_government_uuid"
        , "noiSearch"."local_government_name"
        , "noiSearch"."notice_of_intent_type_code"
        , "noiSearch"."status"
        , "noiSearch"."date_submitted_to_alc"
        , "noiSearch"."decision_date"
        , "noiSearch"."outcome"
        , "noiSearch"."last_update"      
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

  private async compileNoticeOfIntentSearchQuery(searchDto: SearchRequestDto) {
    const query = this.noiSearchRepository.createQueryBuilder('noiSearch');

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

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query.andWhere(
        'noiSearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.decisionOutcome && searchDto.decisionOutcome.length > 0) {
      query.andWhere('noiSearch.outcome IN(:...outcomes)', {
        outcomes: searchDto.decisionOutcome,
      });
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      query.andWhere('noiSearch.notice_of_intent_region_code IN(:...regions)', {
        regions: searchDto.regionCodes,
      });
    }

    this.compileSearchByNameQuery(searchDto, query);
    this.compileParcelSearchQuery(searchDto, query);
    this.compileDecisionSearchQuery(searchDto, query);

    return query;
  }

  private compileDecisionSearchQuery(searchDto: SearchRequestDto, query) {
    if (
      searchDto.dateDecidedTo !== undefined ||
      searchDto.dateDecidedFrom !== undefined ||
      searchDto.decisionMakerCode !== undefined
    ) {
      query = this.joinDecision(query);

      if (searchDto.dateDecidedFrom !== undefined) {
        query = query.andWhere('decision.date >= :dateDecidedFrom', {
          dateDecidedFrom: new Date(searchDto.dateDecidedFrom),
        });
      }

      if (searchDto.dateDecidedTo !== undefined) {
        query = query.andWhere('decision.date <= :dateDecidedTo', {
          dateDecidedTo: new Date(searchDto.dateDecidedTo),
        });
      }

      if (searchDto.decisionMakerCode !== undefined) {
        query = query.andWhere('decision.decision_maker IS NOT NULL');
      }
    }
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

  private compileParcelSearchQuery(searchDto: SearchRequestDto, query) {
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

  private compileSearchByNameQuery(searchDto: SearchRequestDto, query) {
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
