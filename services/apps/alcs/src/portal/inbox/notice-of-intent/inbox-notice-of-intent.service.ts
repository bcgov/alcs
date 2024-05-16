import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, Repository } from 'typeorm';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { SEARCH_CACHE_TIME } from '../../../alcs/search/search.config';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { intersectSets } from '../../../utils/set-helper';
import { NoticeOfIntentOwner } from '../../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
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
      if (bceidBusinessGuid) {
        where += ' OR noiSearch.bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid) {
        where +=
          ' OR (noiSearch.local_government_uuid = :governmentUuid AND noiSearch.date_submitted_to_alc IS NOT NULL)';
      }
    } else {
      if (searchDto.filterBy === 'submitted') {
        where =
          'noiSearch.local_government_uuid = :governmentUuid AND noiSearch.date_submitted_to_alc IS NOT NULL';
      } else {
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
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      didSearch = true;
      this.addPortalStatusResults(searchDto, promises);
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
      `Inbox NOI pre-search search took ${t1 - t0} milliseconds.`,
    );
    return { didSearch, finalResult };
  }

  private addFileNumberResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.noiRepository.find({
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
    const promise = this.noiSubmissionRepository
      .createQueryBuilder('noiSubs')
      .select('noiSubs.fileNumber')
      .where(
        "alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noiSubs.uuid) ->> 'status_type_code' IN(:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
    promises.push(promise);
  }

  private addNameResults(
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const formattedSearchString =
      formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);
    const promise = this.noiSubmissionRepository
      .createQueryBuilder('noiSub')
      .select('noiSub.fileNumber')
      .leftJoin(
        NoticeOfIntentOwner,
        'notice_of_intent_owner',
        'notice_of_intent_owner.notice_of_intent_submission_uuid = noiSub.uuid',
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where(
              "LOWER(notice_of_intent_owner.first_name || ' ' || notice_of_intent_owner.last_name) LIKE ANY (:names)",
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notice_of_intent_owner.first_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notice_of_intent_owner.last_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notice_of_intent_owner.organization_name) LIKE ANY (:names)',
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
    let query = this.noiSubmissionRepository
      .createQueryBuilder('noiSub')
      .select('noiSub.fileNumber')
      .leftJoin(
        NoticeOfIntentParcel,
        'parcel',
        'parcel.notice_of_intent_submission_uuid = noiSub.uuid',
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
    searchDto: InboxRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    if (searchDto.fileTypes.includes('NOI')) {
      const query = this.noiRepository.find({
        select: {
          fileNumber: true,
        },
      });

      promises.push(query);
    }
  }
}
