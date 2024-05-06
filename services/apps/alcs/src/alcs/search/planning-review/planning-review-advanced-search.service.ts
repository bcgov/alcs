import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { QueryRunner, Repository } from 'typeorm';
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
} from '../../../utils/pacific-date-time-helper';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { intersectSets } from '../../../utils/set-helper';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { PlanningReferral } from '../../planning-review/planning-referral/planning-referral.entity';
import { PlanningReviewDecision } from '../../planning-review/planning-review-decision/planning-review-decision.entity';
import { PlanningReview } from '../../planning-review/planning-review.entity';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { PlanningReviewSearchView } from './planning-review-search-view.entity';

@Injectable()
export class PlanningReviewAdvancedSearchService {
  private logger: Logger = new Logger(PlanningReviewAdvancedSearchService.name);

  constructor(
    @InjectRepository(PlanningReviewSearchView)
    private planningReviewSearchRepository: Repository<PlanningReviewSearchView>,
    @InjectRepository(PlanningReview)
    private planningReviewRepository: Repository<PlanningReview>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async search(
    searchDto: SearchRequestDto,
    queryRunner: QueryRunner,
  ): Promise<AdvancedSearchResultDto<PlanningReviewSearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_alcs_planning_review_${searchHash}`;

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
        180, //Seconds
        JSON.stringify([...fileNumbers.values()]),
      );
    }

    if (fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    let query = this.planningReviewSearchRepository
      .createQueryBuilder('planningReviewSearch', queryRunner)
      .where('planningReviewSearch.fileNumber IN(:...fileNumbers)', {
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
    this.logger.debug(
      `ALCS Planning Review search took ${t1 - t0} milliseconds.`,
    );

    return {
      data: results[0],
      total: results[1],
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

      case 'status':
        return '"planningReviewSearch"."open"';

      default:
      case 'dateSubmitted':
        return '"planningReviewSearch"."date_submitted_to_alc"';
    }
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.governmentName) {
      await this.addGovernmentResults(searchDto, promises);
    }

    if (searchDto.regionCode) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      this.addNameResults(searchDto, promises);
    }

    if (searchDto.resolutionNumber || searchDto.resolutionYear) {
      this.addDecisionResolutionResults(searchDto, promises);
    }

    if (searchDto.fileTypes.length > 0) {
      this.addFileTypeResults(searchDto, promises);
    }

    if (searchDto.dateSubmittedTo || searchDto.dateSubmittedFrom) {
      this.addSubmittedDateResults(searchDto, promises);
    }

    if (searchDto.dateDecidedFrom || searchDto.dateDecidedTo) {
      this.addDecisionDateResults(searchDto, promises);
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
      `ALCS Planning Review pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addFileNumberResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.planningReviewRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private async addGovernmentResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const government = await this.governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    const promise = this.planningReviewRepository.find({
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
    const promise = this.planningReviewRepository.find({
      where: {
        regionCode: searchDto.regionCode,
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

    const promise = this.planningReviewRepository
      .createQueryBuilder('planningReview')
      .select('planningReview.fileNumber')
      .where('LOWER(planningReview.document_name) LIKE ANY (:names)', {
        names: formattedSearchString,
      })
      .getMany();
    promises.push(promise);
  }

  private addDecisionResolutionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.planningReviewRepository
      .createQueryBuilder('planningReview')
      .select('planningReview.fileNumber')
      .leftJoin(
        PlanningReviewDecision,
        'decision',
        'decision.planning_review_uuid = "planningReview"."uuid" AND decision.is_draft = false',
      );

    if (searchDto.resolutionNumber !== undefined) {
      query.andWhere('decision.resolution_number = :resolution_number', {
        resolution_number: searchDto.resolutionNumber,
      });
    }

    if (searchDto.resolutionYear !== undefined) {
      query.andWhere('decision.resolution_year = :resolution_year', {
        resolution_year: searchDto.resolutionYear,
      });
    }
    promises.push(query.getMany());
  }

  private addFileTypeResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.planningReviewRepository
      .createQueryBuilder('planningReview')
      .select('planningReview.fileNumber')
      .where('planningReview.type_code IN (:...typeCodes)', {
        typeCodes: searchDto.fileTypes,
      });

    promises.push(query.getMany());
  }

  private addSubmittedDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.planningReviewRepository
      .createQueryBuilder('planningReview')
      .select('planningReview.fileNumber')
      .innerJoin(
        PlanningReferral,
        'referral',
        'planningReview.uuid = referral.planning_review_uuid',
      );

    if (searchDto.dateSubmittedFrom !== undefined) {
      query.andWhere('referral.submission_date >= :date_submitted', {
        date_submitted: new Date(searchDto.dateSubmittedFrom),
      });
    }

    if (searchDto.dateSubmittedTo !== undefined) {
      query.andWhere('referral.submission_date <= :date_submitted', {
        date_submitted: new Date(searchDto.dateSubmittedTo),
      });
    }
    promises.push(query.getMany());
  }

  private addDecisionDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.planningReviewRepository
      .createQueryBuilder('planningReview')
      .select('planningReview.fileNumber')
      .innerJoin(
        PlanningReviewDecision,
        'decision',
        'decision.planning_review_uuid = "planningReview"."uuid" AND decision.is_draft = false',
      );

    if (searchDto.dateDecidedFrom) {
      query.andWhere('decision.date >= :decision_date', {
        decision_date: getStartOfDayToPacific(
          searchDto.dateDecidedFrom,
        ).toISOString(),
      });
    }

    if (searchDto.dateDecidedTo) {
      query.andWhere('decision.date <= :decision_date_to', {
        decision_date_to: getNextDayToPacific(
          searchDto.dateDecidedTo,
        ).toISOString(),
      });
    }
    promises.push(query.getMany());
  }
}
