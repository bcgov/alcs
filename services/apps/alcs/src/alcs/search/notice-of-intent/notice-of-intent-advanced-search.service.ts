import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { QueryRunner, Repository } from 'typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
} from '../../../utils/pacific-date-time-helper';
import { NOI_SEARCH_FILTERS } from '../../../utils/search/notice-of-intent-search-filters';
import { intersectSets } from '../../../utils/set-helper';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { SEARCH_CACHE_TIME } from '../search.config';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent-search-view.entity';

@Injectable()
export class NoticeOfIntentAdvancedSearchService {
  private logger: Logger = new Logger(NoticeOfIntentAdvancedSearchService.name);

  constructor(
    @InjectRepository(NoticeOfIntentSubmissionSearchView)
    private noiSearchRepository: Repository<NoticeOfIntentSubmissionSearchView>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(NoticeOfIntentSubmission)
    private noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async searchNoticeOfIntents(
    searchDto: SearchRequestDto,
    queryRunner: QueryRunner,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentSubmissionSearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_alcs_noi_${searchHash}`;

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

    let query = this.noiSearchRepository
      .createQueryBuilder('noiSearch', queryRunner)
      .innerJoinAndMapOne(
        'noiSearch.noticeOfIntentType',
        'noiSearch.noticeOfIntentType',
        'noticeOfIntentType',
      )
      .andWhere('noiSearch.fileNumber IN(:...fileNumbers)', {
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
    this.logger.debug(`NOI ALCS search took ${t1 - t0} milliseconds.`);

    return {
      data: results[0],
      total: results[1],
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

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      const promise = NOI_SEARCH_FILTERS.addFileNumberResults(
        searchDto,
        this.noiRepository,
      );
      promises.push(promise);
    }

    if (searchDto.legacyId) {
      this.addLegacyIDResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      const promise = NOI_SEARCH_FILTERS.addPortalStatusResults(
        searchDto,
        this.noiSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.governmentName) {
      const promise = NOI_SEARCH_FILTERS.addGovernmentResults(
        searchDto,
        this.noiRepository,
        this.governmentRepository,
      );
      promises.push(promise);
    }

    if (searchDto.regionCode) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      const promise = NOI_SEARCH_FILTERS.addNameResults(
        searchDto,
        this.noiSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      const promise = NOI_SEARCH_FILTERS.addParcelResults(
        searchDto,
        this.noiSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.resolutionNumber || searchDto.resolutionYear) {
      this.addDecisionResolutionResults(searchDto, promises);
    }

    if (searchDto.fileTypes.includes('NOI')) {
      const promise = NOI_SEARCH_FILTERS.addFileTypeResults(
        searchDto,
        this.noiRepository,
      );
      promises.push(promise);
    }

    if (searchDto.dateSubmittedFrom || searchDto.dateSubmittedTo) {
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
      `ALCS Application pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addDecisionResolutionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.noiRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber')
      .leftJoin(
        NoticeOfIntentDecision,
        'decision',
        'decision.notice_of_intent_uuid = "noi"."uuid" AND decision.is_draft = false',
      );

    if (searchDto.resolutionNumber !== undefined) {
      query = query.andWhere(
        'decision.resolution_number = :resolution_number',
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
    promises.push(query.getMany());
  }

  private addLegacyIDResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.noiRepository.find({
      where: {
        legacyId: searchDto.legacyId,
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
    const promise = this.noiRepository.find({
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
    let query = this.noiRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber');

    if (searchDto.dateSubmittedFrom !== undefined) {
      query = query.andWhere(
        'noi.date_submitted_to_alc >= :date_submitted_from',
        {
          date_submitted_from: getStartOfDayToPacific(
            searchDto.dateSubmittedFrom,
          ),
        },
      );
    }

    if (searchDto.dateSubmittedTo !== undefined) {
      query = query.andWhere(
        'noi.date_submitted_to_alc < :date_submitted_to',
        {
          date_submitted_to: getNextDayToPacific(
            searchDto.dateSubmittedTo,
          ),
        },
      );
    }
    promises.push(query.getMany());
  }

  private addDecisionDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.noiRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber')
      .innerJoin(
        NoticeOfIntentDecision,
        'decision',
        'decision.notice_of_intent_uuid = "noi"."uuid" AND decision.is_draft = false',
      );

    if (searchDto.dateDecidedFrom) {
      query = query.andWhere('decision.date >= :decision_date', {
        decision_date: getStartOfDayToPacific(
          searchDto.dateDecidedFrom,
        ).toISOString(),
      });
    }

    if (searchDto.dateDecidedTo) {
      query = query.andWhere('decision.date <= :decision_date_to', {
        decision_date_to: getNextDayToPacific(
          searchDto.dateDecidedTo,
        ).toISOString(),
      });
    }
    promises.push(query.getMany());
  }
}
