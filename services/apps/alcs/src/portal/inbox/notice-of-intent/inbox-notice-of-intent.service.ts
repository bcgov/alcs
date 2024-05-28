import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Repository } from 'typeorm';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { SEARCH_CACHE_TIME } from '../../../alcs/search/search.config';
import { NOI_SEARCH_FILTERS } from '../../../utils/search/notice-of-intent-search-filters';
import { processSearchPromises } from '../../../utils/search/search-intersection';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { AdvancedSearchResultDto, InboxRequestDto } from '../inbox.dto';
import { InboxNoticeOfIntentSubmissionView } from './inbox-notice-of-intent-view.entity';

@Injectable()
export class InboxNoticeOfIntentService {
  private logger: Logger = new Logger(InboxNoticeOfIntentService.name);

  constructor(
    @InjectRepository(InboxNoticeOfIntentSubmissionView)
    private noiSearchRepository: Repository<InboxNoticeOfIntentSubmissionView>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(NoticeOfIntentSubmission)
    private noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    private redisService: RedisService,
  ) {}

  async searchNoticeOfIntents(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ): Promise<AdvancedSearchResultDto<InboxNoticeOfIntentSubmissionView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_inbox_noi_${userUuid}_${searchHash}`;

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

    const query = this.noiSearchRepository
      .createQueryBuilder('noiSearch')
      .innerJoinAndMapOne(
        'noiSearch.noticeOfIntentType',
        'noiSearch.noticeOfIntentType',
        'noticeOfIntentType',
      )
      .orderBy('"noiSearch"."last_update"', 'DESC')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    if (fileNumbers.size > 0) {
      query.andWhere('"noiSearch"."file_number" IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers.values()],
      });
    }

    //User Permissions
    let where = 'noiSearch.created_by_uuid = :userUuid';
    if (!searchDto.filterBy) {
      if (bceidBusinessGuid && !searchDto.createdByMe) {
        where += ' OR noiSearch.bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid && !searchDto.createdByMe) {
        where +=
          ' OR (noiSearch.local_government_uuid = :governmentUuid AND noiSearch.date_submitted_to_alc IS NOT NULL)';
      }
    } else {
      if (searchDto.filterBy === 'submitted') {
        where =
          'noiSearch.local_government_uuid = :governmentUuid AND noiSearch.date_submitted_to_alc IS NOT NULL';
      } else if (!searchDto.createdByMe) {
        where =
          '(noiSearch.created_by_uuid = :userUuid OR noiSearch.bceid_business_guid = :bceidBusinessGuid)';
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
    this.logger.debug(`Inbox NOI search took ${t1 - t0} milliseconds.`);

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
      const promise = NOI_SEARCH_FILTERS.addFileNumberResults(
        searchDto,
        this.noiRepository,
      );
      promises.push(promise);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      didSearch = true;
      const promise = NOI_SEARCH_FILTERS.addPortalStatusResults(
        searchDto,
        this.noiSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.name) {
      didSearch = true;
      const promise = NOI_SEARCH_FILTERS.addNameResults(
        searchDto,
        this.noiSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.pid || searchDto.civicAddress) {
      didSearch = true;
      const promise = NOI_SEARCH_FILTERS.addParcelResults(
        searchDto,
        this.noiSubmissionRepository,
      );
      promises.push(promise);
    }

    if (searchDto.fileTypes.includes('NOI')) {
      didSearch = true;
      const promise = NOI_SEARCH_FILTERS.addFileTypeResults(
        searchDto,
        this.noiRepository,
      );
      promises.push(promise);
    }

    const t0 = performance.now();
    const finalResult = await processSearchPromises(promises);
    const t1 = performance.now();
    this.logger.debug(
      `Inbox NOI pre-search search took ${t1 - t0} milliseconds.`,
    );
    return { didSearch, finalResult };
  }
}
