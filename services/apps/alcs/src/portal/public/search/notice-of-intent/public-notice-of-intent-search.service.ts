import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { Brackets, In, Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntent } from '../../../../alcs/notice-of-intent/notice-of-intent.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../../utils/search-helper';
import { intersectSets } from '../../../../utils/set-helper';
import { NoticeOfIntentOwner } from '../../../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
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
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.fileTypes) {
      this.addFileTypeResults(searchDto, promises);
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      this.addPortalStatusResult(searchDto, promises);
    }

    if (searchDto.governmentName) {
      await this.addGovernmentResults(searchDto, promises);
    }

    if (searchDto.decisionOutcome && searchDto.decisionOutcome.length > 0) {
      this.addDecisionOutcomeResults(searchDto, promises);
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

  private addFileNumberResults(
    searchDto: SearchRequestDto,
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

  private addPortalStatusResult(
    searchDto: SearchRequestDto,
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

  private async addGovernmentResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const government = await this.governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    const promise = this.noiRepository.find({
      where: {
        localGovernmentUuid: government.uuid,
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

  private addNameResults(
    searchDto: SearchRequestDto,
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
    searchDto: SearchRequestDto,
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
    searchDto: SearchRequestDto,
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
