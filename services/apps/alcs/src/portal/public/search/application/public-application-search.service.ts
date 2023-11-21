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
      case 'lastUpdate':
        return '"appSearch"."last_update"';
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
            , "appSearch"."outcome"
            , "appSearch"."date_submitted_to_alc"
            , "appSearch"."decision_date"
            , "appSearch"."last_update"
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
    const query =
      this.applicationSearchRepository.createQueryBuilder('appSearch');

    if (searchDto.fileNumber) {
      query
        .andWhere('appSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      query.andWhere(
        "alcs.get_current_status_for_application_submission_by_uuid(appSearch.uuid) ->> 'status_type_code' IN(:...statuses)",
        {
          statuses: searchDto.portalStatusCodes,
        },
      );
    }

    if (searchDto.decisionOutcome && searchDto.decisionOutcome.length > 0) {
      query.andWhere('appSearch.outcome IN(:...outcomes)', {
        outcomes: searchDto.decisionOutcome,
      });
    }

    if (searchDto.governmentName) {
      const government = await this.governmentRepository.findOneByOrFail({
        name: searchDto.governmentName,
      });

      query.andWhere(
        'appSearch.local_government_uuid = :local_government_uuid',
        {
          local_government_uuid: government.uuid,
        },
      );
    }

    if (searchDto.regionCodes && searchDto.regionCodes.length > 0) {
      query.andWhere('appSearch.application_region_code IN(:...regions)', {
        regions: searchDto.regionCodes,
      });
    }

    this.compileSearchByNameQuery(searchDto, query);
    this.compileParcelSearchQuery(searchDto, query);
    this.compileDecisionSearchQuery(searchDto, query);
    this.compileFileTypeSearchQuery(searchDto, query);

    return query;
  }

  private compileDecisionSearchQuery(searchDto: SearchRequestDto, query) {
    if (
      searchDto.dateDecidedTo !== undefined ||
      searchDto.dateDecidedFrom !== undefined ||
      searchDto.decisionMakerCode !== undefined
    ) {
      query = this.joinApplicationDecision(query);

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
        query = query.andWhere(
          'decision.decision_maker_code = :decisionMakerCode',
          {
            decisionMakerCode: searchDto.decisionMakerCode,
          },
        );
      }
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

  private compileParcelSearchQuery(searchDto: SearchRequestDto, query) {
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
      query = query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }
    return query;
  }

  private compileSearchByNameQuery(searchDto: SearchRequestDto, query) {
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

  private compileFileTypeSearchQuery(searchDto: SearchRequestDto, query) {
    if (searchDto.fileTypes.length > 0) {
      // if decision is not joined yet -> join it. The join of decision happens in compileApplicationDecisionSearchQuery
      if (
        searchDto.dateDecidedFrom === undefined &&
        searchDto.dateDecidedTo === undefined &&
        searchDto.decisionMakerCode === undefined
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
