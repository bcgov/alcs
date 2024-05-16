import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, Repository } from 'typeorm';
import { ApplicationDecisionComponent } from '../../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import { Application } from '../../../alcs/application/application.entity';
import { SEARCH_CACHE_TIME } from '../../../alcs/search/search.config';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { intersectSets } from '../../../utils/set-helper';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';
import { ApplicationOwner } from '../../application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../../application-submission/application-submission.entity';
import { AdvancedSearchResultDto, InboxRequestDto } from '../inbox.dto';
import { InboxApplicationSubmissionView } from './inbox-application-view.entity';

@Injectable()
export class InboxApplicationService {
  private logger: Logger = new Logger(InboxApplicationService.name);

  constructor(
    @InjectRepository(InboxApplicationSubmissionView)
    private applicationInboxRepository: Repository<InboxApplicationSubmissionView>,
    private redisService: RedisService,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(ApplicationSubmissionReview)
    private applicationReviewRepository: Repository<ApplicationSubmissionReview>,
  ) {}

  async searchApplications(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ): Promise<AdvancedSearchResultDto<InboxApplicationSubmissionView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_inbox_application_${userUuid}_${searchHash}`;

    const client = this.redisService.getClient();
    const cachedSearch = await client.get(searchKey);

    let fileNumbers = new Set<string>();
    let didSearch = false;

    if (cachedSearch) {
      const cachedNumbers = JSON.parse(cachedSearch) as string[];
      fileNumbers = new Set<string>(cachedNumbers);
      didSearch = true;
    } else {
      const res = await this.searchForFileNumbers(searchDto);
      fileNumbers = res.finalResult;
      didSearch = res.didSearch;
      if (didSearch) {
        await client.setEx(
          searchKey,
          SEARCH_CACHE_TIME,
          JSON.stringify([...fileNumbers.values()]),
        );
      }
    }

    if (didSearch && fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    const query = this.applicationInboxRepository
      .createQueryBuilder('appSearch')
      .innerJoinAndMapOne(
        'appSearch.applicationType',
        'appSearch.applicationType',
        'applicationType',
      )
      .orderBy('appSearch.last_update', 'DESC')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    if (fileNumbers.size > 0) {
      query.andWhere('appSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers.values()],
      });
    }

    //User Permissions
    let where = '"appSearch".created_by_uuid = :userUuid';
    if (!searchDto.filterBy) {
      if (bceidBusinessGuid) {
        where += ' OR "appSearch".bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid) {
        where += ` OR ("appSearch".local_government_uuid = :governmentUuid AND ("appSearch".date_submitted_to_alc IS NOT NULL OR appSearch.status ->> 'status_type_code' IN ('REVG', 'SUBG', 'INCG')))`;
      }
      //Prevent someone without governmentUuid from using filterBy
    } else if (governmentUuid && bceidBusinessGuid) {
      if (searchDto.filterBy === 'submitted') {
        where = `"appSearch".local_government_uuid = :governmentUuid AND ("appSearch".date_submitted_to_alc IS NOT NULL OR appSearch.status ->> 'status_type_code' IN ('REVG', 'SUBG', 'INCG'))`;
      } else {
        where =
          '("appSearch".created_by_uuid = :userUuid OR "appSearch".bceid_business_guid = :bceidBusinessGuid)';
      }
    }
    query.andWhere(`(${where})`, {
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    });

    const t0 = performance.now();
    const results = await Promise.all([query.getMany(), query.getCount()]);
    const t1 = performance.now();
    this.logger.debug(`Inbox Application search took ${t1 - t0} milliseconds.`);

    return {
      data: results[0],
      total: results[1],
    };
  }

  private async searchForFileNumbers(searchDto: InboxRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];
    let didSearch = false;

    if (searchDto.fileNumber) {
      didSearch = true;
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      didSearch = true;
      this.addPortalStatusResults(searchDto, promises);
    }

    if (searchDto.governmentFileNumber) {
      didSearch = true;
      this.addGovernmentFileNumberResults(searchDto, promises);
    }

    if (searchDto.name) {
      didSearch = true;
      this.addNameResults(searchDto, promises);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      didSearch = true;
      this.addParcelResults(searchDto, promises);
    }

    if (searchDto.fileTypes.length > 0) {
      didSearch = true;
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
      `Inbox Application pre-search search took ${t1 - t0} milliseconds.`,
    );
    return { didSearch, finalResult };
  }

  private addFileNumberResults(
    searchDto: InboxRequestDto,
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

  private addPortalStatusResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.applicationSubmissionRepository
      .createQueryBuilder('appSubs')
      .select('appSubs.fileNumber')
      .where(
        "alcs.get_current_status_for_application_submission_by_uuid(appSubs.uuid) ->> 'status_type_code' IN (:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
    promises.push(promise);
  }

  private addGovernmentFileNumberResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.applicationReviewRepository
      .find({
        where: {
          localGovernmentFileNumber: searchDto.governmentFileNumber,
        },
        select: {
          applicationFileNumber: true,
        },
      })
      .then((results) => {
        return results.map((res) => ({
          fileNumber: res.applicationFileNumber,
        }));
      });
    promises.push(promise);
  }

  private addNameResults(
    searchDto: InboxRequestDto,
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
    searchDto: InboxRequestDto,
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

  private addFileTypeResults(
    searchDto: InboxRequestDto,
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
