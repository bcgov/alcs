import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { ApplicationDecision } from '../application-decision/application-decision.entity';
import { Application } from '../application/application.entity';
import { Covenant } from '../covenant/covenant.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { SearchRequestDto } from './search.dto';
import { ApplicationSubmissionSearchView } from './search.entity';

const CARD_RELATIONSHIP = {
  card: {
    board: true,
  },
  localGovernment: true,
};

// -- done -- file number = exact search
// -- done --submissionType -- submission type for application, for the rest it will be different queries
// -- done -- name = owner table
//     -- done -- primary contact
//     -- done -- parcel owner
//     -- done -- organization
//     -- done -- ministry or department
// -- done -- is include other parcels -> parcels = exact match
// -- done -- pid -> parcels = exact match
// -- done -- civic address -> parcels = partial match
// -- done -- resolution number -> decisions = exact match
// -- done -- resolution year -> decisions = exact match
// -- done -- legacy id -> exact match
// -- done -- portal status -> submission -> calculated field? = exact match
// -- inpr -- application type code -> submission = exact match
// -- done -- local government -> submission = exact match
// -- done -- region -> submission = exact match
// -- done -- dateFrom -> application -> date_submitted = exact match
// -- done -- dateTo -> application -> date_submitted = exact match
// -- done -- dateDecidedFrom -> application -> decision date = exact match
// -- done -- dateDecidedTo -> application -> decision date = exact match

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(NoticeOfIntent)
    private noiRepository: Repository<NoticeOfIntent>,
    @InjectRepository(PlanningReview)
    private planningReviewRepository: Repository<PlanningReview>,
    @InjectRepository(Covenant)
    private covenantRepository: Repository<Covenant>,
    @InjectRepository(ApplicationSubmissionSearchView)
    private applicationSearchRepository: Repository<ApplicationSubmissionSearchView>,
    @InjectRepository(LocalGovernment)
    private governmentRepository: Repository<LocalGovernment>,
  ) {}

  async searchApplications(searchDto: SearchRequestDto) {
    let query = this.applicationSearchRepository
      .createQueryBuilder('appSearch')
      .where('1 = 1');

    if (searchDto.fileNumber) {
      query = query
        .andWhere('appSearch.file_number = :fileNumber')
        .setParameters({ fileNumber: searchDto.fileNumber ?? null });
    }

    if (searchDto.legacyId) {
      query = query.andWhere('appSearch.legacy_id = :legacyId', {
        legacyId: searchDto.legacyId,
      });
    }

    if (searchDto.name) {
      const formattedSearchString = this.formatNameSearchText(searchDto.name!);
      console.log(this.formatNameSearchText(searchDto.name!));
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

    if (
      (searchDto.pid || searchDto.civicAddress) &&
      searchDto.isIncludeOtherParcels
    ) {
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

    if (
      searchDto.resolutionNumber !== undefined ||
      searchDto.resolutionYear !== undefined
    ) {
      query = query.leftJoin(
        ApplicationDecision,
        'decision',
        'decision.application_uuid = "appSearch"."application_uuid"',
      );

      if (searchDto.resolutionNumber !== undefined) {
        query = query.andWhere(
          'decision.resolution_number = :resolution_number',
          {
            resolution_number: searchDto.resolutionNumber,
          },
        );
      }

      if (searchDto.resolutionYear !== undefined) {
        query = query.andWhere('decision.resolution_year = :resolution_year', {
          resolution_year: searchDto.resolutionYear,
        });
      }
    }

    if (searchDto.portalStatusCode) {
      query = query.andWhere(
        "alcs.get_current_status_for_submission_by_uuid(appSearch.uuid) ->> 'status_type_code' = :status",
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

    // check dates toIsoString
    if (searchDto.dateSubmittedFrom) {
      query = query.andWhere(
        'appSearch.date_submitted_to_alc >= :date_submitted_to_alc',
        {
          date_submitted_to_alc: formatIncomingDate(
            searchDto.dateSubmittedFrom,
          )!.toISOString(),
        },
      );
    }

    if (searchDto.dateSubmittedTo) {
      query = query.andWhere(
        'appSearch.date_submitted_to_alc <= :date_submitted_to_alc',
        {
          application_region_code: formatIncomingDate(
            searchDto.dateSubmittedTo,
          )!.toISOString(),
        },
      );
    }

    if (searchDto.dateDecidedFrom) {
      query = query.andWhere('appSearch.decision_date >= :decision_date', {
        decision_date: formatIncomingDate(
          searchDto.dateDecidedFrom,
        )!.toISOString(),
      });
    }

    if (searchDto.dateDecidedTo) {
      query = query.andWhere('appSearch.decision_date <= :decision_date_to', {
        decision_date_to: formatIncomingDate(
          searchDto.dateDecidedTo,
        )!.toISOString(),
      });
    }

    console.log('search applications', query.getQuery());

    const result = await query
      .innerJoinAndMapOne(
        'appSearch.applicationType',
        'appSearch.applicationType',
        'applicationType',
      )
      .getMany();

    // TODO remove this
    if (result && result.length > 2) {
      console.log('search applications result > 2', result[0], result[1]);
    } else {
      console.log('search applications ', result);
    }

    return result;
    // const application = await this.applicationRepository.findOne({
    //   where: {
    //     fileNumber,
    //   },
    //   relations: {
    //     card: true,
    //     localGovernment: true,
    //     type: true,
    //   },
    // });
    // return application;
  }

  async getNoi(fileNumber: string) {
    const noi = await this.noiRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
      },
    });

    return noi;
  }

  async getPlanningReview(fileNumber: string) {
    const planningReview = await this.planningReviewRepository.findOne({
      where: {
        fileNumber,
        card: { archived: false },
      },
      relations: CARD_RELATIONSHIP,
    });

    return planningReview;
  }

  async getCovenant(fileNumber: string) {
    const covenant = await this.covenantRepository.findOne({
      where: {
        fileNumber,
        card: { archived: false },
      },
      relations: CARD_RELATIONSHIP,
    });

    return covenant;
  }

  formatNameSearchText(input: string): string {
    let output = input
      .split(' ')
      .map((word) => `%${word}%`)
      .join(',');
    output += `,%${input}%`;
    return `{${output}}`;
  }
}
