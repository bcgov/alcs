import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { QueryRunner, Repository } from 'typeorm';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { getNextDayToPacific, getStartOfDayToPacific } from '../../../utils/pacific-date-time-helper';
import { APP_SEARCH_FILTERS } from '../../../utils/search/application-search-filters';
import { processSearchPromises } from '../../../utils/search/search-intersection';
import { ApplicationDecision } from '../../application-decision/application-decision.entity';
import { Application } from '../../application/application.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SEARCH_CACHE_TIME } from '../search.config';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { ApplicationSubmissionSearchView } from './application-search-view.entity';
import { ApplicationSubmissionStatusSearchView } from '../status/application-search-status-view.entity';

@Injectable()
export class ApplicationAdvancedSearchService {
  private logger: Logger = new Logger(ApplicationAdvancedSearchService.name);

  constructor(
    @InjectRepository(ApplicationSubmissionSearchView)
    private applicationSearchRepository: Repository<ApplicationSubmissionSearchView>,
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async searchApplications(
    searchDto: SearchRequestDto,
    queryRunner: QueryRunner,
  ): Promise<AdvancedSearchResultDto<ApplicationSubmissionSearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_alcs_application_${searchHash}`;

    const client = this.redisService.getClient();
    const cachedSearch = await client.get(searchKey);

    let fileNumbers = new Set<string>();
    if (cachedSearch) {
      const cachedNumbers = JSON.parse(cachedSearch) as string[];
      fileNumbers = new Set<string>(cachedNumbers);
    } else {
      fileNumbers = await this.searchForFileNumbers(searchDto);
      await client.setEx(searchKey, SEARCH_CACHE_TIME, JSON.stringify([...fileNumbers.values()]));
    }

    if (fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    let query = this.applicationSearchRepository
      .createQueryBuilder('appSearch', queryRunner)
      .andWhere('appSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers.values()],
      });

    if (searchDto.sortField === 'status') {
      query = query.innerJoin(
        ApplicationSubmissionStatusSearchView,
        'app_status',
        'app_status.file_number = "appSearch"."file_number"',
      );
    }

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(sortQuery, searchDto.sortDirection, searchDto.sortDirection === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);
    const t0 = performance.now();
    const results = await Promise.all([query.getMany(), query.getCount()]);
    const t1 = performance.now();
    this.logger.debug(`ALCS Application search took ${t1 - t0} milliseconds.`);

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

      case 'status':
        return `"app_status"."status" ->> 'label' `;

      default:
      case 'dateSubmitted':
        return '"appSearch"."date_submitted_to_alc"';
    }
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      const promise = APP_SEARCH_FILTERS.addFileNumberResults(searchDto, this.applicationRepository);
      promises.push(promise);
    }

    if (searchDto.legacyId) {
      this.addLegacyIDResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      const promise = APP_SEARCH_FILTERS.addPortalStatusResults(searchDto, this.applicationSubmissionRepository);
      promises.push(promise);
    }

    if (searchDto.tagIds && searchDto.tagIds.length > 0) {
      const promise = APP_SEARCH_FILTERS.addTagsResults(searchDto, this.applicationRepository);
      promises.push(promise);
    }

    if (searchDto.tagCategoryId) {
      const promise = APP_SEARCH_FILTERS.addTagCategoryResults(searchDto, this.applicationRepository);
      promises.push(promise);
    }

    if (searchDto.decisionMaker) {
      const promise = APP_SEARCH_FILTERS.addDecisionMakerResults(searchDto, this.applicationRepository);
      promises.push(promise);
    }

    if (searchDto.decisionOutcomes && searchDto.decisionOutcomes.length > 0) {
      const promise = APP_SEARCH_FILTERS.addDecisionOutcomeResults(searchDto, this.applicationRepository);
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

    if (searchDto.regionCode) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      const promise = APP_SEARCH_FILTERS.addNameResults(searchDto, this.applicationSubmissionRepository);
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      const promise = APP_SEARCH_FILTERS.addParcelResults(searchDto, this.applicationSubmissionRepository);
      promises.push(promise);
    }

    if (searchDto.resolutionNumber || searchDto.resolutionYear) {
      this.addDecisionResolutionResults(searchDto, promises);
    }

    if (searchDto.fileTypes.length > 0) {
      const promise = APP_SEARCH_FILTERS.addFileTypeResults(searchDto, this.applicationRepository);
      promises.push(promise);
    }

    if (searchDto.dateSubmittedFrom || searchDto.dateSubmittedTo) {
      this.addSubmittedDateResults(searchDto, promises);
    }

    if (searchDto.dateDecidedFrom || searchDto.dateDecidedTo) {
      this.addDecisionDateResults(searchDto, promises);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(`ALCS Application pre-search search took ${t1 - t0} milliseconds.`);
    return finalResult;
  }

  private addLegacyIDResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const promise = this.applicationRepository.find({
      where: {
        legacyId: searchDto.legacyId,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private addRegionResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const promise = this.applicationRepository.find({
      where: {
        regionCode: searchDto.regionCode,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private addDecisionResolutionResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const query = this.applicationRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .leftJoin(
        ApplicationDecision,
        'decision',
        'decision.application_uuid = "app"."uuid" AND decision.is_draft = false',
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

  private addSubmittedDateResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const query = this.applicationRepository.createQueryBuilder('app').select('app.fileNumber');

    if (searchDto.dateSubmittedFrom !== undefined) {
      query.andWhere('app.date_submitted_to_alc >= :date_submitted_from', {
        date_submitted_from: getStartOfDayToPacific(searchDto.dateSubmittedFrom).toISOString(),
      });
    }

    if (searchDto.dateSubmittedTo !== undefined) {
      query.andWhere('app.date_submitted_to_alc < :date_submitted_to', {
        date_submitted_to: getNextDayToPacific(searchDto.dateSubmittedTo).toISOString(),
      });
    }
    promises.push(query.getMany());
  }

  private addDecisionDateResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const query = this.applicationRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .innerJoin(
        ApplicationDecision,
        'decision',
        'decision.application_uuid = "app"."uuid" AND decision.is_draft = false',
      );

    if (searchDto.dateDecidedFrom) {
      query.andWhere('decision.date >= :decision_date', {
        decision_date: getStartOfDayToPacific(searchDto.dateDecidedFrom).toISOString(),
      });
    }

    if (searchDto.dateDecidedTo) {
      query.andWhere('decision.date < :decision_date_to', {
        decision_date_to: getNextDayToPacific(searchDto.dateDecidedTo).toISOString(),
      });
    }
    promises.push(query.getMany());
  }
}
