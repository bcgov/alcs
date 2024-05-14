import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../../portal/application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
} from '../../../utils/pacific-date-time-helper';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { intersectSets } from '../../../utils/set-helper';
import { ApplicationDecisionComponent } from '../../application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../application-decision/application-decision.entity';
import { Application } from '../../application/application.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SEARCH_CACHE_TIME } from '../search.config';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { ApplicationSubmissionSearchView } from './application-search-view.entity';

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

    let query = this.applicationSearchRepository
      .createQueryBuilder('appSearch', queryRunner)
      .andWhere('appSearch.fileNumber IN(:...fileNumbers)', {
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

      case 'portalStatus':
        return `"appSearch"."status" ->> 'label' `;

      default:
      case 'dateSubmitted':
        return '"appSearch"."date_submitted_to_alc"';
    }
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.legacyId) {
      this.addLegacyIDResults(searchDto, promises);
    }

    if (searchDto.portalStatusCode) {
      this.addPortalStatusResults(searchDto, promises);
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

    if (searchDto.pid || searchDto.civicAddress) {
      this.addParcelResults(searchDto, promises);
    }

    if (searchDto.resolutionNumber || searchDto.resolutionYear) {
      this.addDecisionResolutionResults(searchDto, promises);
    }

    if (searchDto.fileTypes.length > 0) {
      this.addFileTypeResults(searchDto, promises);
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

  private addFileNumberResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.applicationRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
      },
      select: {
        fileNumber: true,
      },
    });
    promises.push(promise);
  }

  private addLegacyIDResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
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

  private addPortalStatusResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.applicationSubmissionRepository
      .createQueryBuilder('appSubs')
      .select('appSubs.fileNumber')
      .where(
        "alcs.get_current_status_for_application_submission_by_uuid(appSubs.uuid) ->> 'status_type_code' = :statusCode",
        {
          statusCode: searchDto.portalStatusCode,
        },
      )
      .getMany();
    promises.push(promise);
  }

  private async addGovernmentResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const government = await this.governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    const promise = this.applicationRepository.find({
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

  private addNameResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const formattedSearchString =
      formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);
    const promise = this.applicationSubmissionRepository
      .createQueryBuilder('appSub')
      .select('appSub.fileNumber')
      .leftJoin(
        ApplicationOwner,
        'application_owner',
        'application_owner.application_submission_uuid = appSub.uuid',
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where(
              "LOWER(application_owner.first_name || ' ' || application_owner.last_name) LIKE ANY (:names)",
              {
                names: formattedSearchString,
              },
            )
            .orWhere('LOWER(application_owner.first_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            })
            .orWhere('LOWER(application_owner.last_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            })
            .orWhere(
              'LOWER(application_owner.organization_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            ),
        ),
      )
      .getMany();
    promises.push(promise);
  }

  private addParcelResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.applicationSubmissionRepository
      .createQueryBuilder('appSub')
      .select('appSub.fileNumber')
      .leftJoin(
        ApplicationParcel,
        'parcel',
        'parcel.application_submission_uuid = appSub.uuid',
      );

    if (searchDto.pid) {
      query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }

    promises.push(query.getMany());
  }

  private addDecisionResolutionResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
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

  private addFileTypeResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.applicationRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .leftJoin(
        ApplicationDecision,
        'decision',
        'decision.application_uuid = "app"."uuid" AND decision.is_draft = FALSE',
      )
      .leftJoin(
        ApplicationDecisionComponent,
        'decisionComponent',
        'decisionComponent.application_decision_uuid = decision.uuid',
      )
      .where('app.type_code IN (:...typeCodes)', {
        typeCodes: searchDto.fileTypes,
      })
      .orWhere(
        'decisionComponent.application_decision_component_type_code IN (:...typeCodes)',
        {
          typeCodes: searchDto.fileTypes,
        },
      );

    promises.push(query.getMany());
  }

  private addSubmittedDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const query = this.applicationRepository
      .createQueryBuilder('app')
      .select('app.fileNumber');

    if (searchDto.dateSubmittedFrom !== undefined) {
      query.andWhere('app.date_submitted_to_alc >= :date_submitted_from', {
        date_submitted_from: getStartOfDayToPacific(
          searchDto.dateSubmittedFrom,
        ).toISOString(),
      });
    }

    if (searchDto.dateSubmittedTo !== undefined) {
      query.andWhere('app.date_submitted_to_alc <= :date_submitted_to', {
        date_submitted_to: getNextDayToPacific(
          searchDto.dateSubmittedTo,
        ).toISOString(),
      });
    }
    promises.push(query.getMany());
  }

  private addDecisionDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
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
