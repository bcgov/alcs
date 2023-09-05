import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { LocalGovernment } from '../../local-government/local-government.entity';
import {
  AdvancedSearchResultDto,
  NonApplicationsSearchRequestDto,
} from '../search.dto';
import { NonApplicationSearchView } from './non-applications-view.entity';

@Injectable()
export class NonApplicationsAdvancedSearchService {
  constructor(
    @InjectRepository(NonApplicationSearchView)
    private nonApplicationSearchRepository: Repository<NonApplicationSearchView>,
  ) {}

  async searchNonApplications(
    searchDto: NonApplicationsSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NonApplicationSearchView[]>> {
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

  private compileSortQuery(searchDto: NonApplicationsSearchRequestDto) {
    switch (searchDto.sortField) {
      case 'applicant':
        return '"nonApp"."applicant"';

      case 'government':
        return '"localGovernment"."name"';

      case 'type':
        return '"nonApp"."class"';

      default:
      case 'fileId':
        return '"nonApp"."file_number"';
    }
  }

  private async compileSearchQuery(searchDto: NonApplicationsSearchRequestDto) {
    let query = this.nonApplicationSearchRepository
      .createQueryBuilder('nonApp')
      .leftJoinAndMapOne(
        'nonApp.localGovernment',
        LocalGovernment,
        'localGovernment',
        '"nonApp"."local_government_uuid" = "localGovernment".uuid',
      )
      .where('1 = 1');

    if (searchDto.fileNumber) {
      query = query.andWhere('nonApp.file_number = :fileNumber', {
        fileNumber: searchDto.fileNumber ?? null,
      });
    }

    if (searchDto.regionCode) {
      query = query.andWhere('nonApp.region_code = :regionCode', {
        regionCode: searchDto.regionCode,
      });
    }

    if (searchDto.governmentName) {
      query = query.andWhere('localGovernment.name = :localGovernmentName', {
        localGovernmentName: searchDto.governmentName,
      });
    }

    if (searchDto.name) {
      const formattedSearchString =
        formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);

      query = query.andWhere('LOWER(nonApp.applicant) LIKE ANY (:names)', {
        names: formattedSearchString,
      });
    }

    return query;
  }
}
