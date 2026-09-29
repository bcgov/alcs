import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as hash from 'object-hash';
import { QueryRunner, Repository } from 'typeorm';
import { processSearchPromises } from '../../../utils/search/search-intersection';
import { ComplianceAndEnforcement } from '../../compliance-and-enforcement/compliance-and-enforcement.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SEARCH_CACHE_TIME } from '../search.config';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { ComplianceAndEnforcementSearchView } from './compliance-and-enforcement-search-view.entity';

@Injectable()
export class ComplianceAndEnforcementAdvancedSearchService {
  private logger: Logger = new Logger(ComplianceAndEnforcementAdvancedSearchService.name);

  constructor(
    @InjectRepository(ComplianceAndEnforcementSearchView)
    private ComplianceAndEnforcementSearchViewRepository: Repository<ComplianceAndEnforcementSearchView>,
    @InjectRepository(ComplianceAndEnforcement)
    private complianceAndEnforcementRepository: Repository<ComplianceAndEnforcement>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
    private redisService: RedisService,
  ) {}

  async search(
    searchDto: SearchRequestDto,
    queryRunner: QueryRunner,
  ): Promise<AdvancedSearchResultDto<ComplianceAndEnforcementSearchView[]>> {
    const searchHash = hash(searchDto);
    const searchKey = `search_alcs_compliance_and_enforcement_${searchHash}`;

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

    let query = this.ComplianceAndEnforcementSearchViewRepository.createQueryBuilder(
      'complianceAndEnforcementSearch',
      queryRunner,
    ).andWhere('complianceAndEnforcementSearch.fileNumber IN(:...fileNumbers)', {
      fileNumbers: [...fileNumbers.values()],
    });

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(sortQuery, searchDto.sortDirection, searchDto.sortDirection === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    const results = await query.getManyAndCount();

    return {
      data: results[0],
      total: results[1],
    };
  }

  private compileSortQuery(searchDto: SearchRequestDto) {
    return '"complianceAndEnforcementSearch"."file_number"';
  }

  private async searchForFileNumbers(searchDto: SearchRequestDto) {
    const promises: Promise<{ fileNumber: string }[]>[] = [];

    if (searchDto.fileNumber) {
      this.addFileNumberResults(searchDto, promises);
    }

    if (searchDto.fileTypes.includes('CAE')) {
      this.addFileTypeResults(searchDto, promises);
    }

    const finalResult = await processSearchPromises(promises);

    return finalResult;
  }

  private addFileNumberResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const promise = this.complianceAndEnforcementRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
      },
      select: {
        fileNumber: true,
      },
    });

    promises.push(promise);
  }

  addFileTypeResults(searchDto: SearchRequestDto, promises: Promise<{ fileNumber: string }[]>[]) {
    const promise = this.complianceAndEnforcementRepository.find({
      select: {
        fileNumber: true,
      },
    });

    promises.push(promise);
  }
}
