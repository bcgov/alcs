import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, In, Repository } from 'typeorm';
import { ApplicationDecisionComponent } from '../../../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../../../alcs/application-decision/application-decision.entity';
import { Application } from '../../../../alcs/application/application.entity';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../../utils/search-helper';
import { intersectSets } from '../../../../utils/set-helper';
import { ApplicationOwner } from '../../../application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../../application-submission/application-parcel/application-parcel.entity';
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
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      this.addPortalStatusResults(searchDto, promises);
    }

    if (searchDto.governmentName) {
      await this.addGovernmentResults(searchDto, promises);
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      this.addRegionResults(searchDto, promises);
    }

    if (searchDto.name) {
      this.addNameResults(searchDto, promises);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      this.addParcelResults(searchDto, promises);
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
      this.addFileTypeResults(searchDto, promises);
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
      `Public Application pre-search search took ${t1 - t0} milliseconds.`,
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

  private addPortalStatusResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.applicationSubmissionRepository
      .createQueryBuilder('appSubs')
      .select('appSubs.fileNumber')
      .where(
        "alcs.get_current_status_for_application_submission_by_uuid(appSubs.uuid) ->> 'status_type_code' IN(:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
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

  private addParcelResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.applicationSubmissionRepository
      .createQueryBuilder('appSub')
      .select('appSub.fileNumber')
      .leftJoin(
        ApplicationParcel,
        'parcel',
        'parcel.application_submission_uuid = appSub.uuid',
      );

    if (searchDto.pid) {
      query = query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query = query.andWhere(
        'LOWER(parcel.civic_address) like LOWER(:civic_address)',
        {
          civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
        },
      );
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
}
