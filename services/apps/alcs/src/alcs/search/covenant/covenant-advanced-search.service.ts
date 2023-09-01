import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { Covenant } from '../../covenant/covenant.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import {
  AdvancedSearchResultDto,
  CovenantSearchRequestDto,
} from '../search.dto';

@Injectable()
export class CovenantAdvancedSearchService {
  constructor(
    @InjectRepository(Covenant)
    private covenantRepository: Repository<Covenant>,
  ) {}

  async searchCovenants(
    searchDto: CovenantSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<Covenant[]>> {
    let query = await this.compileSearchQuery(searchDto);
    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(sortQuery, searchDto.sortDirection)
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);
    const result = await query.getManyAndCount();

    return {
      data: result[0],
      total: result[1],
    };
  }

  private async compileSearchQuery(searchDto: CovenantSearchRequestDto) {
    let query = this.covenantRepository
      .createQueryBuilder('cov')
      .leftJoinAndMapOne(
        'cov.localGovernment',
        LocalGovernment,
        'localGovernment',
        'cov.local_government_uuid = "localGovernment".uuid',
      )
      .where('1 = 1'); // need this so the code can safely chain andWhere

    if (searchDto.fileNumber) {
      query = query.andWhere('cov.file_number = :fileNumber', {
        fileNumber: searchDto.fileNumber,
      });
    }

    if (searchDto.governmentName) {
      query = query.andWhere('localGovernment.name = :governmentName', {
        governmentName: searchDto.governmentName,
      });
    }

    if (searchDto.regionCode) {
      query = query.andWhere('cov.region_code = :regionCode', {
        regionCode: searchDto.regionCode,
      });
    }

    if (searchDto.name) {
      const formattedSearchString =
        formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);

      query = query.andWhere('LOWER(cov.applicant) LIKE ANY (:names)', {
        names: formattedSearchString,
      });
    }

    return query;
  }

  private compileSortQuery(searchDto: CovenantSearchRequestDto) {
    switch (searchDto.sortField) {
      case 'applicant':
        return '"cov"."applicant"';

      case 'government':
        return '"cov"."localGovernment_name"';

      default:
      case 'file_number':
        return '"cov"."file_number"';
    }
  }
}
