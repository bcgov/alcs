import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { QueryRunner, Repository } from 'typeorm';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { intersectSets } from '../../../utils/set-helper';
import { InquiryParcel } from '../../inquiry/inquiry-parcel/inquiry-parcel.entity';
import { Inquiry } from '../../inquiry/inquiry.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { InquirySearchView } from './inquiry-search-view.entity';

@Injectable()
export class InquiryAdvancedSearchService {
  private logger: Logger = new Logger(InquiryAdvancedSearchService.name);

  constructor(
    @InjectRepository(InquirySearchView)
    private inquirySearchViewRepository: Repository<InquirySearchView>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async search(
    searchDto: SearchRequestDto,
    queryRunner: QueryRunner,
  ): Promise<AdvancedSearchResultDto<InquirySearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_alcs_inquiry_${searchHash}`;

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
        180, //Seconds
        JSON.stringify([...fileNumbers.values()]),
      );
    }

    if (fileNumbers.size === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    let query = this.inquirySearchViewRepository
      .createQueryBuilder('inquirySearch', queryRunner)
      .innerJoinAndMapOne(
        'inquirySearch.inquiryType',
        'inquirySearch.inquiryType',
        'inquiryType',
      )
      .andWhere('inquirySearch.fileNumber IN(:...fileNumbers)', {
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
    const results = await query.getManyAndCount();
    const t1 = performance.now();
    this.logger.debug(`ALCS Inquiry search took ${t1 - t0} milliseconds.`);

    return {
      data: results[0],
      total: results[1],
    };
  }

  private compileSortQuery(searchDto: SearchRequestDto) {
    switch (searchDto.sortField) {
      case 'fileId':
        return '"inquirySearch"."file_number"';

      case 'type':
        return '"inquirySearch"."inquiry_type_code"';

      case 'applicant':
        return '"inquirySearch"."inquirer_last_name"';

      case 'government':
        return '"inquirySearch"."local_government_name"';

      case 'status':
        return '"inquirySearch"."open"';

      default:
      case 'dateSubmitted':
        return '"inquirySearch"."date_submitted_to_alc"';
    }
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      this.addFileNumberResults(searchDto, promises);
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

    if (searchDto.dateSubmittedTo || searchDto.dateSubmittedFrom) {
      this.addSubmittedDateResults(searchDto, promises);
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
      `ALCS Inquiry pre-search search took ${t1 - t0} milliseconds.`,
    );
    return finalResult;
  }

  private addFileNumberResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    const promise = this.inquiryRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
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

    const promise = this.inquiryRepository.find({
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
    const promise = this.inquiryRepository.find({
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
    const promise = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.fileNumber')
      .where(
        "LOWER(inquirySearch.inquirer_first_name || ' ' || inquirySearch.inquirer_last_name) LIKE ANY (:names)",
        {
          names: formattedSearchString,
        },
      )
      .orWhere('LOWER(inquirySearch.inquirer_first_name) LIKE ANY (:names)', {
        names: formattedSearchString,
      })
      .orWhere('LOWER(inquirySearch.inquirer_last_name) LIKE ANY (:names)', {
        names: formattedSearchString,
      })
      .orWhere('LOWER(inquirySearch.inquirer_organization) LIKE ANY (:names)', {
        names: formattedSearchString,
      })
      .getMany();
    promises.push(promise);
  }

  private addParcelResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.fileNumber')
      .leftJoin(InquiryParcel, 'parcel', 'parcel.inquiry_uuid = inquiry.uuid');

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
    const query = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.fileNumber')
      .where('inquiry.type_code IN (:...typeCodes)', {
        typeCodes: searchDto.fileTypes,
      });

    promises.push(query.getMany());
  }

  private addSubmittedDateResults(
    searchDto: SearchRequestDto,
    promises: Promise<{ fileNumber: string }[]>[],
  ) {
    let query = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.fileNumber');

    if (searchDto.dateSubmittedFrom !== undefined) {
      query = query.andWhere(
        'inquiry.date_submitted_to_alc >= :date_submitted',
        {
          date_submitted: new Date(searchDto.dateSubmittedFrom),
        },
      );
    }

    if (searchDto.dateSubmittedTo !== undefined) {
      query = query.andWhere(
        'inquiry.date_submitted_to_alc <= :date_submitted',
        {
          date_submitted: new Date(searchDto.dateSubmittedTo),
        },
      );
    }
    promises.push(query.getMany());
  }
}
