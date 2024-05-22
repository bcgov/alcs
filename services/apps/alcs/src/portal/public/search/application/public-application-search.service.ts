import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { In, Repository } from 'typeorm';
import { ApplicationDecision } from '../../../../alcs/application-decision/application-decision.entity';
import { Application } from '../../../../alcs/application/application.entity';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { APP_SEARCH_FILTERS } from '../../../../utils/search/application-search-filters';
import { processSearchPromises } from '../../../../utils/search/search-intersection';
import { ApplicationSubmission } from '../../../application-submission/application-submission.entity';
import {
  AdvancedSearchResultDto,
  SearchRequestDto,
} from '../public-search.dto';
import { PublicApplicationSubmissionSearchView } from './public-application-search-view.entity';

@Injectable()
export class PublicApplicationSearchService {
  private logger: Logger = new Logger(PublicApplicationSearchService.name);

  constructor(
    @InjectRepository(PublicApplicationSubmissionSearchView)
    private applicationSearchRepository: Repository<PublicApplicationSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private redisService: RedisService,
  ) {}

  async searchApplications(
    searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<PublicApplicationSubmissionSearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_public_application_${searchHash}`;

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

    let query = this.applicationSearchRepository
      .createQueryBuilder('appSearch')
      .andWhere('appSearch.fileNumber IN(:...fileNumbers)', {
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
      `Application public search took ${t1 - t0} milliseconds.`,
    );

    return {
      data: results[0],
      total: results[1],
    };
  }

  private compileSortQuery(searchDto: SearchRequestDto) {
    switch (searchDto.sortField) {
      case 'fileId':
        return '"appSearch"."file_number"';

      case 'ownerName':
        return '"appSearch"."applicant"';

      case 'type':
        return '"appSearch"."application_type_code"';

      case 'government':
        return '"appSearch"."local_government_name"';

      case 'portalStatus':
        return `"appSearch"."status" ->> 'label' `;

      default:
      case 'lastUpdate':
        return '"appSearch"."last_update"';
    }
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      const promise = APP_SEARCH_FILTERS.addFileNumberResults(
        searchDto,
        this.applicationRepository,
      );
      promises.push(promise);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      const promise = APP_SEARCH_FILTERS.addPortalStatusResults(
        searchDto,
        this.applicationSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.governmentName) {
      const promise = APP_SEARCH_FILTERS.addGovernmentResults(
        searchDto,
        this.applicationRepository,
        this.governmentRepository,
      );
      promises.push(promise);
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      const promise = APP_SEARCH_FILTERS.addNameResults(
        searchDto,
        this.applicationSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      const promise = APP_SEARCH_FILTERS.addParcelResults(
        searchDto,
        this.applicationSubmissionRepository,
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

    if (searchDto.decisionOutcome && searchDto.decisionOutcome.length > 0) {
      this.addDecisionOutcomeResults(searchDto, promises);
    }

    if (searchDto.fileTypes.length > 0) {
      const promise = APP_SEARCH_FILTERS.addFileTypeResults(
        searchDto,
        this.applicationRepository,
      );
      promises.push(promise);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(
      `Public Application pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addDecisionOutcomeResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.applicationSearchRepository.find({
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
    const promise = this.applicationRepository.find({
      where: {
        regionCode: In(searchDto.regionCodes!),
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private addDecisionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.applicationRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .innerJoin(
        ApplicationDecision,
        'decision',
        'decision.application_uuid = "app"."uuid" AND decision.is_draft = FALSE',
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
      query = query.andWhere(
        'decision.decision_maker_code = :decisionMakerCode',
        {
          decisionMakerCode: searchDto.decisionMakerCode,
        },
      );
    }
    promises.push(query.getMany());
  }
}
