import { Brackets, Repository } from 'typeorm';
import { ApplicationDecisionComponent } from '../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { Application } from '../../alcs/application/application.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { InboxRequestDto } from '../../portal/inbox/inbox.dto';
import { SearchRequestDto } from '../../portal/public/search/public-search.dto';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../search-helper';

export const APP_SEARCH_FILTERS = {
  addFileNumberResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    applicationRepository: Repository<Application>,
  ) => {
    return applicationRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
      },
      select: {
        fileNumber: true,
      },
    });
  },

  addPortalStatusResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    applicationSubmissionRepository: Repository<ApplicationSubmission>,
  ) => {
    return applicationSubmissionRepository
      .createQueryBuilder('appSubs')
      .select('appSubs.fileNumber')
      .where(
        "alcs.get_current_status_for_application_submission_by_uuid(appSubs.uuid) ->> 'status_type_code' IN (:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
  },
  addTagsResults: (searchDto: SearchRequestDto | InboxRequestDto, appRepository: Repository<Application>) => {
    return appRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .leftJoin('application_tag', 'application_tag', 'application_tag.application_uuid = app.uuid')
      .where('application_tag.tag_uuid IN (:...tagIds)', {
        tagIds: searchDto.tagIds,
      })
      .getMany();
  },
  addTagCategoryResults: (searchDto: SearchRequestDto | InboxRequestDto, appRepository: Repository<Application>) => {
    return appRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .leftJoin('application_tag', 'application_tag', 'application_tag.application_uuid = app.uuid')
      .leftJoin('tag', 'tag', 'tag.uuid = application_tag.tag_uuid')
      .where('tag.category_uuid IN (:categoryId)', {
        categoryId: searchDto.tagCategoryId,
      })
      .getMany();
  },
  addNameResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    applicationSubmissionRepository: Repository<ApplicationSubmission>,
  ) => {
    const formattedSearchString = formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);
    return applicationSubmissionRepository
      .createQueryBuilder('appSub')
      .select('appSub.fileNumber')
      .leftJoin(ApplicationOwner, 'application_owner', 'application_owner.application_submission_uuid = appSub.uuid')
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("LOWER(application_owner.first_name || ' ' || application_owner.last_name) LIKE ANY (:names)", {
              names: formattedSearchString,
            })
            .orWhere('LOWER(application_owner.first_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            })
            .orWhere('LOWER(application_owner.last_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            })
            .orWhere('LOWER(application_owner.organization_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            }),
        ),
      )
      .getMany();
  },
  addGovernmentResults: async (
    searchDto: SearchRequestDto,
    applicationRepository: Repository<Application>,
    governmentRepository: Repository<LocalGovernment>,
  ) => {
    const government = await governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    return applicationRepository.find({
      where: {
        localGovernmentUuid: government.uuid,
      },
      select: {
        fileNumber: true,
      },
    });
  },
  addParcelResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    applicationSubmissionRepository: Repository<ApplicationSubmission>,
  ) => {
    const query = applicationSubmissionRepository
      .createQueryBuilder('appSub')
      .select('appSub.fileNumber')
      .leftJoin(ApplicationParcel, 'parcel', 'parcel.application_submission_uuid = appSub.uuid');

    if (searchDto.pid) {
      query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }

    return query.getMany();
  },
  addFileTypeResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    applicationRepository: Repository<Application>,
  ) => {
    const query = applicationRepository
      .createQueryBuilder('app')
      .select('app.fileNumber')
      .leftJoin(
        ApplicationDecision,
        'decision',
        'decision.application_uuid = "app"."uuid" AND decision.is_draft = FALSE',
      )
      .leftJoin(
        ApplicationDecisionComponent,
        'decisionComponent',
        'decisionComponent.application_decision_uuid = decision.uuid',
      )
      .where('app.type_code IN (:...typeCodes)', {
        typeCodes: searchDto.fileTypes,
      })
      .orWhere('decisionComponent.application_decision_component_type_code IN (:...typeCodes)', {
        typeCodes: searchDto.fileTypes,
      });

    return query.getMany();
  },
};
