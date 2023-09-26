import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ApplicationDecisionComponent } from '../../../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../../../alcs/application-decision/application-decision.entity';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../../utils/search-helper';
import { ApplicationOwner } from '../../../application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../../application-submission/application-parcel/application-parcel.entity';
import {
  AdvancedSearchResultDto,
  SearchRequestDto,
} from '../public-search.dto';
import { PublicApplicationSubmissionSearchView } from './public-application-search-view.entity';

@Injectable()
export class PublicApplicationSearchService {
  constructor(
    @InjectRepository(PublicApplicationSubmissionSearchView)
    private applicationSearchRepository: Repository<PublicApplicationSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async searchApplications(
    searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<PublicApplicationSubmissionSearchView[]>> {
    let query = await this.compileApplicationSearchQuery(searchDto);

    query = this.compileApplicationGroupBySearchQuery(query);

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

  private compileSortQuery(searchDto: SearchRequestDto) {
    switch (searchDto.sortField) {
      case 'fileId':
        return '"appSearch"."file_number"';

      case 'ownerName':
        return '"appSearch"."applicant"';

      case 'type':
        return '"appSearch"."application_type_code"';

      case 'government':
        return '"appSearch"."local_government_name"';

      case 'portalStatus':
        return `"appSearch"."status" ->> 'label' `;

      default:
      case 'dateSubmitted':
        return '"appSearch"."date_submitted_to_alc"';
    }
  }

  private compileApplicationGroupBySearchQuery(query) {
    query = query
      .innerJoinAndMapOne(
        'appSearch.applicationType',
        'appSearch.applicationType',
        'applicationType',
      )
      .groupBy(
        `
              "appSearch"."uuid"
            , "appSearch"."application_uuid"
            , "appSearch"."application_region_code" 
            , "appSearch"."file_number"
            , "appSearch"."applicant"
            , "appSearch"."local_government_uuid"
            , "appSearch"."local_government_name"
            , "appSearch"."application_type_code"
            , "appSearch"."status"
            , "appSearch"."date_submitted_to_alc"
            , "appSearch"."decision_date"
            , "applicationType"."audit_deleted_date_at"
            , "applicationType"."audit_created_at"
            , "applicationType"."audit_updated_by"
            , "applicationType"."audit_updated_at"
            , "applicationType"."audit_created_by"
            , "applicationType"."short_label"
            , "applicationType"."label"
            , "applicationType"."code"
            , "applicationType"."background_color"
            , "applicationType"."text_color"
            , "applicationType"."html_description"
            , "applicationType"."portal_label"
            `,
      );
    return query;
  }

  private async compileApplicationSearchQuery(searchDto: SearchRequestDto) {
    let query = this.applicationSearchRepository
      .createQueryBuilder('appSearch')
      .where('appSearch.is_draft = false');

    if (searchDto.fileNumber) {
      query = query
        .andWhere('appSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.portalStatusCode) {
      query = query.andWhere(
        "alcs.get_current_status_for_application_submission_by_uuid(appSearch.uuid) ->> 'status_type_code' = :status",
        {
          status: searchDto.portalStatusCode,
        },
      );
    }

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query = query.andWhere(
        'appSearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.regionCode) {
      query = query.andWhere(
        'appSearch.application_region_code = :application_region_code',
        {
          application_region_code: searchDto.regionCode,
        },
      );
    }

    query = this.compileApplicationSearchByNameQuery(searchDto, query);
    query = this.compileApplicationParcelSearchQuery(searchDto, query);
    query = this.compileApplicationDecisionSearchQuery(searchDto, query);
    query = this.compileApplicationFileTypeSearchQuery(searchDto, query);

    return query;
  }

  private compileApplicationDecisionSearchQuery(
    searchDto: SearchRequestDto,
    query,
  ) {
    if (
      searchDto.dateDecidedTo !== undefined ||
      searchDto.dateDecidedFrom !== undefined
    ) {
      query = this.joinApplicationDecision(query);
      // TODO
      // if (searchDto.resolutionNumber !== undefined) {
      //   query = query.andWhere(
      //     'decision.resolution_number = :resolution_number',
      //     {
      //       resolution_number: searchDto.resolutionNumber,
      //     },
      //   );
      // }
      //
      // if (searchDto.resolutionYear !== undefined) {
      //   query = query.andWhere('decision.resolution_year = :resolution_year', {
      //     resolution_year: searchDto.resolutionYear,
      //   });
      // }
    }
    return query;
  }

  private joinApplicationDecision(query: any) {
    query = query.leftJoin(
      ApplicationDecision,
      'decision',
      'decision.application_uuid = "appSearch"."application_uuid"',
    );
    return query;
  }

  private compileApplicationParcelSearchQuery(
    searchDto: SearchRequestDto,
    query,
  ) {
    if (searchDto.pid || searchDto.civicAddress) {
      query = query.leftJoin(
        ApplicationParcel,
        'parcel',
        "parcel.application_submission_uuid = appSearch.uuid AND parcel.parcel_type IN ('application', 'other')",
      );
    } else {
      query = query.leftJoin(
        ApplicationParcel,
        'parcel',
        "parcel.application_submission_uuid = appSearch.uuid AND parcel.parcel_type = 'application'",
      );
    }

    if (searchDto.pid) {
      query = query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query = query.andWhere('parcel.civic_address like :civic_address', {
        civic_address: `%${searchDto.civicAddress}%`,
      });
    }
    return query;
  }

  private compileApplicationSearchByNameQuery(
    searchDto: SearchRequestDto,
    query,
  ) {
    if (searchDto.name) {
      const formattedSearchString =
        formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);

      query = query
        .leftJoin(
          ApplicationOwner,
          'application_owner',
          'application_owner.application_submission_uuid = appSearch.uuid',
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
              .orWhere(
                'LOWER(application_owner.first_name) LIKE ANY (:names)',
                {
                  names: formattedSearchString,
                },
              )
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
        );
    }
    return query;
  }

  private compileApplicationFileTypeSearchQuery(
    searchDto: SearchRequestDto,
    query,
  ) {
    if (searchDto.fileTypes.length > 0) {
      // if decision is not joined yet -> join it. The join of decision happens in compileApplicationDecisionSearchQuery
      if (
        searchDto.dateDecidedFrom === undefined &&
        searchDto.dateDecidedTo === undefined
      ) {
        query = this.joinApplicationDecision(query);
      }

      query = query.leftJoin(
        ApplicationDecisionComponent,
        'decisionComponent',
        'decisionComponent.application_decision_uuid = decision.uuid',
      );

      query = query.andWhere(
        new Brackets((qb) =>
          qb
            .where('appSearch.application_type_code IN (:...typeCodes)', {
              typeCodes: searchDto.fileTypes,
            })
            .orWhere(
              'decisionComponent.application_decision_component_type_code IN (:...typeCodes)',
              {
                typeCodes: searchDto.fileTypes,
              },
            ),
        ),
      );
    }

    return query;
  }
}
