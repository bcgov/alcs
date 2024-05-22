import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { In, Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntent } from '../../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NOI_SEARCH_FILTERS } from '../../../../utils/search/notice-of-intent-search-filters';
import { processSearchPromises } from '../../../../utils/search/search-intersection';
import { NoticeOfIntentSubmission } from '../../../notice-of-intent-submission/notice-of-intent-submission.entity';
import {
  AdvancedSearchResultDto,
  SearchRequestDto,
} from '../public-search.dto';
import { PublicNoticeOfIntentSubmissionSearchView } from './public-notice-of-intent-search-view.entity';

@Injectable()
export class PublicNoticeOfIntentSearchService {
  private logger: Logger = new Logger(PublicNoticeOfIntentSearchService.name);

  constructor(
    @InjectRepository(PublicNoticeOfIntentSubmissionSearchView)
    private noiSearchRepository: Repository<PublicNoticeOfIntentSubmissionSearchView>,
    @InjectRepository(NoticeOfIntentSubmission)
    private noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async searchNoticeOfIntents(
    searchDto: SearchRequestDto,
  ): Promise<
    AdvancedSearchResultDto<PublicNoticeOfIntentSubmissionSearchView[]>
  > {
    const searchHash = hash(searchDto);
    const searchKey = `search_public_noi_${searchHash}`;

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

    let query = this.noiSearchRepository
      .createQueryBuilder('noiSearch')
      .andWhere('noiSearch.fileNumber IN(:...fileNumbers)', {
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
    this.logger.debug(`NOI public search took ${t1 - t0} milliseconds.`);

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
      case 'lastUpdate':
        return '"noiSearch"."last_update"';
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

    if (searchDto.fileTypes.includes('NOI')) {
      const promise = NOI_SEARCH_FILTERS.addFileTypeResults(
        searchDto,
        this.noiRepository,
      );
      promises.push(promise);
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

    if (searchDto.decisionOutcome && searchDto.decisionOutcome.length > 0) {
      this.addDecisionOutcomeResults(searchDto, promises);
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
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

    if (
      searchDto.dateDecidedTo !== undefined ||
      searchDto.dateDecidedFrom !== undefined ||
      searchDto.decisionMakerCode !== undefined
    ) {
      this.addDecisionResults(searchDto, promises);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(`NOI pre-search search took ${t1 - t0} milliseconds.`);
    return finalResult;
  }

  private addDecisionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.noiRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber')
      .innerJoin(
        NoticeOfIntentDecision,
        'decision',
        'decision.notice_of_intent_uuid = "noi"."uuid" AND decision.is_draft = FALSE',
      );

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
    promises.push(query.getMany());
  }

  private addDecisionOutcomeResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.noiSearchRepository.find({
      where: {
        outcome: In(searchDto.decisionOutcome!),
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
        regionCode: In(searchDto.regionCodes!),
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }
}
