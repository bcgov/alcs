import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
} from '../../../utils/pacific-date-time-helper';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { InquiryParcel } from '../../inquiry/inquiry-parcel/inquiry-parcel.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { AdvancedSearchResultDto, SearchRequestDto } from '../search.dto';
import { InquirySearchView } from './inquiry-search-view.entity';

@Injectable()
export class InquiryAdvancedSearchService {
  constructor(
    @InjectRepository(InquirySearchView)
    private inquirySearchViewRepository: Repository<InquirySearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async search(
    searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<InquirySearchView[]>> {
    let query = await this.compileInquirySearchQuery(searchDto);

    query = this.compileGroupBySearchQuery(query);

    const sortQuery = this.compileSortQuery(searchDto);

    query = query
      .orderBy(
        sortQuery,
        searchDto.sortDirection,
        searchDto.sortDirection === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST',
      )
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    // console.log(query.getSql());

    const result = await query.getManyAndCount();

    return {
      data: result[0],
      total: result[1],
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

  private compileGroupBySearchQuery(
    query: SelectQueryBuilder<InquirySearchView>,
  ) {
    query = query
      // FIXME: This is a quick fix for the search performance issues. It temporarily allows
      //        submissions with deleted submission types to be shown. For now, there are no
      //        deleted submission types, so this should be fine, but should be fixed soon.
      .withDeleted()
      .innerJoinAndMapOne(
        'inquirySearch.inquiryType',
        'inquirySearch.inquiryType',
        'inquiryType',
      )
      .groupBy(
        `
        "inquirySearch"."inquiry_uuid"
        , "inquirySearch"."inquiry_region_code" 
        , "inquirySearch"."file_number"
        , "inquirySearch"."local_government_uuid"
        , "inquirySearch"."local_government_name"
        , "inquirySearch"."inquirer_first_name"
        , "inquirySearch"."inquirer_last_name"
        , "inquirySearch"."inquirer_organization"
        , "inquirySearch"."open"
        , "inquirySearch"."inquiry_type_code"
        , "inquirySearch"."date_submitted_to_alc"
        , "inquiryType"."audit_deleted_date_at"
        , "inquiryType"."audit_created_at"
        , "inquiryType"."audit_updated_by"
        , "inquiryType"."audit_updated_at"
        , "inquiryType"."audit_created_by"
        , "inquiryType"."short_label"
        , "inquiryType"."label"
        , "inquiryType"."code"
        , "inquiryType"."html_description"
        `,
      );
    return query;
  }

  private async compileInquirySearchQuery(searchDto: SearchRequestDto) {
    let query =
      this.inquirySearchViewRepository.createQueryBuilder('inquirySearch');

    if (searchDto.fileNumber) {
      query = query
        .andWhere('inquirySearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query = query.andWhere(
        'inquirySearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.regionCode) {
      query = query.andWhere(
        'inquirySearch.inquiry_region_code = :region_code',
        {
          region_code: searchDto.regionCode,
        },
      );
    }

    query = this.compileSearchByNameQuery(searchDto, query);
    query = this.compileParcelSearchQuery(searchDto, query);
    query = this.compileDateRangeSearchQuery(searchDto, query);
    query = this.compileFileTypeSearchQuery(searchDto, query);

    return query;
  }

  private compileDateRangeSearchQuery(searchDto: SearchRequestDto, query) {
    if (searchDto.dateSubmittedFrom) {
      query = query.andWhere(
        'inquirySearch.date_submitted_to_alc >= :date_submitted_from_alc',
        {
          date_submitted_from_alc: getStartOfDayToPacific(
            searchDto.dateSubmittedFrom,
          ).toISOString(),
        },
      );
    }

    if (searchDto.dateSubmittedTo) {
      query = query.andWhere(
        'inquirySearch.date_submitted_to_alc < :date_submitted_to_alc',
        {
          date_submitted_to_alc: getNextDayToPacific(
            searchDto.dateSubmittedTo,
          ).toISOString(),
        },
      );
    }

    return query;
  }

  private compileParcelSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<InquirySearchView>,
  ) {
    if (searchDto.pid || searchDto.civicAddress) {
      query = query.leftJoin(
        InquiryParcel,
        'parcel',
        'parcel.inquiry_uuid = inquirySearch.inquiry_uuid',
      );
    }

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
    return query;
  }

  private compileSearchByNameQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<InquirySearchView>,
  ) {
    if (searchDto.name) {
      const formattedSearchString =
        formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);

      query = query
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
        .orWhere(
          'LOWER(inquirySearch.inquirer_organization) LIKE ANY (:names)',
          {
            names: formattedSearchString,
          },
        );
    }
    return query;
  }

  private compileFileTypeSearchQuery(
    searchDto: SearchRequestDto,
    query: SelectQueryBuilder<InquirySearchView>,
  ) {
    if (searchDto.fileTypes.length > 0) {
      // if decision is not joined yet -> join it. The join of decision happens in compileApplicationDecisionSearchQuery

      query = query.andWhere(
        new Brackets((qb) =>
          qb.where('inquirySearch.inquiry_type_code IN (:...typeCodes)', {
            typeCodes: searchDto.fileTypes,
          }),
        ),
      );
    }

    return query;
  }
}
