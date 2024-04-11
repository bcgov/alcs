import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
} from '../../../utils/pacific-date-time-helper';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { PlanningReviewDecision } from '../../planning-review/planning-review-decision/planning-review-decision.entity';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { PlanningReviewSearchView } from './planning-review-search-view.entity';

@Injectable()
export class PlanningReviewAdvancedSearchService {
  constructor(
    @InjectRepository(PlanningReviewSearchView)
    private planningReviewSearchRepo: Repository<PlanningReviewSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async search(
    searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<PlanningReviewSearchView[]>> {
    let query = await this.compileSearchQuery(searchDto);

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(
        sortQuery,
        searchDto.sortDirection,
        searchDto.sortDirection === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST',
      )
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
        return '"planningReviewSearch"."file_number"';

      case 'ownerName':
        return '"planningReviewSearch"."document_name"';

      case 'type':
        return '"planningReviewSearch"."planning_review_type_code"';

      case 'government':
        return '"planningReviewSearch"."local_government_name"';

      default:
      case 'dateSubmitted':
        return '"planningReviewSearch"."date_submitted_to_alc"';
    }
  }

  private async compileSearchQuery(searchDto: SearchRequestDto) {
    let query = this.planningReviewSearchRepo.createQueryBuilder(
      'planningReviewSearch',
    );

    if (searchDto.fileNumber) {
      query = query
        .andWhere('planningReviewSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query = query.andWhere(
        'planningReviewSearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.regionCode) {
      query = query.andWhere(
        'planningReviewSearch.region_code = :region_code',
        {
          region_code: searchDto.regionCode,
        },
      );
    }

    query = this.compileSearchByNameQuery(searchDto, query);
    query = this.compileDecisionSearchQuery(searchDto, query);
    query = this.compileDateRangeSearchQuery(searchDto, query);
    query = this.compileSearchByTypeQuery(searchDto, query);

    return query;
  }

  private compileDateRangeSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<PlanningReviewSearchView>,
  ) {
    if (searchDto.dateSubmittedFrom) {
      query = query.andWhere(
        'planningReviewSearch.date_submitted_to_alc >= :date_submitted_from_alc',
        {
          date_submitted_from_alc: getStartOfDayToPacific(
            searchDto.dateSubmittedFrom,
          ).toISOString(),
        },
      );
    }

    if (searchDto.dateSubmittedTo) {
      query = query.andWhere(
        'planningReviewSearch.date_submitted_to_alc < :date_submitted_to_alc',
        {
          date_submitted_to_alc: getNextDayToPacific(
            searchDto.dateSubmittedTo,
          ).toISOString(),
        },
      );
    }

    return query;
  }

  private compileDecisionSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<PlanningReviewSearchView>,
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
      PlanningReviewDecision,
      'decision',
      'decision.planning_review_uuid = "planningReviewSearch"."uuid" AND decision.is_draft = false',
    );
    return query;
  }

  private compileSearchByNameQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<PlanningReviewSearchView>,
  ) {
    if (searchDto.name) {
      const formattedSearchString =
        formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);

      query = query.andWhere(
        'LOWER(planningReviewSearch.document_name) LIKE ANY (:names)',
        {
          names: formattedSearchString,
        },
      );
    }
    return query;
  }

  private compileSearchByTypeQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<PlanningReviewSearchView>,
  ) {
    if (searchDto.fileTypes.length > 0) {
      query = query.andWhere(
        'planningReviewSearch.planning_review_type_code IN (:...typeCodes)',
        {
          typeCodes: searchDto.fileTypes,
        },
      );
    }

    return query;
  }
}
