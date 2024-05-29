import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Repository } from 'typeorm';
import { Application } from '../../../alcs/application/application.entity';
import { SEARCH_CACHE_TIME } from '../../../alcs/search/search.config';
import { APP_SEARCH_FILTERS } from '../../../utils/search/application-search-filters';
import { processSearchPromises } from '../../../utils/search/search-intersection';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';
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
      if (bceidBusinessGuid && !searchDto.createdByMe) {
        where += ' OR "appSearch".bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid && !searchDto.createdByMe) {
        where += ` OR ("appSearch".local_government_uuid = :governmentUuid AND ("appSearch".date_submitted_to_alc IS NOT NULL OR appSearch.status ->> 'status_type_code' IN ('REVG', 'SUBG', 'INCG')))`;
      }
      //Prevent someone without governmentUuid from using filterBy
    } else if (governmentUuid && bceidBusinessGuid) {
      if (searchDto.filterBy === 'submitted') {
        where = `"appSearch".local_government_uuid = :governmentUuid AND ("appSearch".date_submitted_to_alc IS NOT NULL OR appSearch.status ->> 'status_type_code' IN ('REVG', 'SUBG', 'INCG'))`;
      } else if (!searchDto.createdByMe) {
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
      const promise = APP_SEARCH_FILTERS.addFileNumberResults(
        searchDto,
        this.applicationRepository,
      );
      promises.push(promise);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      didSearch = true;
      const promise = APP_SEARCH_FILTERS.addPortalStatusResults(
        searchDto,
        this.applicationSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.governmentFileNumber) {
      didSearch = true;
      this.addGovernmentFileNumberResults(searchDto, promises);
    }

    if (searchDto.name) {
      didSearch = true;
      const promise = APP_SEARCH_FILTERS.addNameResults(
        searchDto,
        this.applicationSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      didSearch = true;
      const promise = APP_SEARCH_FILTERS.addParcelResults(
        searchDto,
        this.applicationSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.fileTypes.length > 0) {
      didSearch = true;
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
      `Inbox Application pre-search search took ${t1 - t0} milliseconds.`,
    );
    return { didSearch, finalResult };
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
}
