import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ApplicationDecisionComponent } from '../../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../../../utils/search-helper';
import { ApplicationOwner } from '../../application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../application-submission/application-parcel/application-parcel.entity';
import { AdvancedSearchResultDto, InboxRequestDto } from '../inbox.dto';
import { InboxApplicationSubmissionView } from './inbox-application-view.entity';

@Injectable()
export class InboxApplicationService {
  constructor(
    @InjectRepository(InboxApplicationSubmissionView)
    private applicationInboxRepository: Repository<InboxApplicationSubmissionView>,
  ) {}

  async searchApplications(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ): Promise<AdvancedSearchResultDto<InboxApplicationSubmissionView[]>> {
    let query = await this.compileApplicationSearchQuery(
      searchDto,
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    );
    query = this.compileApplicationGroupBySearchQuery(query);

    query = query
      .orderBy('"appSearch"."last_update"', 'DESC')
      .offset((searchDto.page - 1) * searchDto.pageSize)
      .limit(searchDto.pageSize);

    const result = await query.getManyAndCount();

    return {
      data: result[0],
      total: result[1],
    };
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
            , "appSearch"."file_number"
            , "appSearch"."applicant"
            , "appSearch"."local_government_uuid"
            , "appSearch"."application_type_code"
            , "appSearch"."local_government_file_number"
            , "appSearch"."status"
            , "appSearch"."created_at"
            , "appSearch"."date_submitted_to_alc"
            , "appSearch"."last_update"
            , "appSearch"."created_by_uuid"
            , "appSearch"."bceid_business_guid"
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

  private async compileApplicationSearchQuery(
    searchDto: InboxRequestDto,
    userUuid: string,
    bceidBusinessGuid: string | null,
    governmentUuid: string | null,
  ) {
    const query =
      this.applicationInboxRepository.createQueryBuilder('appSearch');

    //User Permissions
    let where = 'appSearch.created_by_uuid = :userUuid';
    if (!searchDto.filterBy) {
      if (bceidBusinessGuid) {
        where += ' OR appSearch.bceid_business_guid = :bceidBusinessGuid';
      }
      if (governmentUuid) {
        where +=
          ' OR (appSearch.local_government_uuid = :governmentUuid AND appSearch.date_submitted_to_alc IS NOT NULL)';
      }
    } else {
      if (searchDto.filterBy === 'submitted') {
        where = 'appSearch.local_government_uuid = :governmentUuid';
      } else {
        where =
          '(appSearch.created_by_uuid = :userUuid OR appSearch.bceid_business_guid = :bceidBusinessGuid)';
      }
    }
    query.andWhere(`(${where})`, {
      userUuid,
      bceidBusinessGuid,
      governmentUuid,
    });

    if (searchDto.fileNumber) {
      query
        .andWhere('appSearch.file_number = :fileNumber')
        .andWhere('appSearch.created_by_uuid = :userUuid')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null, userUuid });
    }

    if (searchDto.portalStatusCodes && searchDto.portalStatusCodes.length > 0) {
      query.andWhere(
        "alcs.get_current_status_for_application_submission_by_uuid(appSearch.uuid) ->> 'status_type_code' IN(:...statuses)",
        {
          statuses: searchDto.portalStatusCodes,
        },
      );
    }

    if (searchDto.governmentFileNumber) {
      query
        .andWhere(
          'appSearch.local_government_file_number = :governmentFileNumber',
        )
        .setParameters({
          governmentFileNumber: searchDto.governmentFileNumber,
        });
    }

    this.compileSearchByNameQuery(searchDto, query);
    this.compileParcelSearchQuery(searchDto, query);
    this.compileFileTypeSearchQuery(searchDto, query);

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

  private compileParcelSearchQuery(searchDto: InboxRequestDto, query) {
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

  private compileSearchByNameQuery(searchDto: InboxRequestDto, query) {
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

  private compileFileTypeSearchQuery(searchDto: InboxRequestDto, query) {
    if (searchDto.fileTypes.length > 0) {
      query = this.joinApplicationDecision(query);

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
