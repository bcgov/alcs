import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { In, Repository } from 'typeorm';
import {
  ApplicationGrpcResponse,
  ApplicationReviewGrpc,
} from '../alcs/application-grpc/alcs-application.message.interface';
import { AlcsApplicationService } from '../alcs/application-grpc/alcs-application.service';
import { ApplicationTypeService } from '../alcs/application-type/application-type.service';
import {
  LocalGovernment,
  LocalGovernmentService,
} from '../alcs/local-government/local-government.service';
import { CompletedApplicationProposalReview } from '../application-review/application-proposal-review.service';
import { User } from '../user/user.entity';
import { ValidatedApplication } from './application-proposal-validator.service';
import {
  ApplicationProposalDetailedDto,
  ApplicationProposalDto,
  ApplicationProposalUpdateDto,
} from './application-proposal.dto';
import { ApplicationProposal } from './application-proposal.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';

const LG_VISIBLE_STATUSES = [
  APPLICATION_STATUS.SUBMITTED_TO_LG,
  APPLICATION_STATUS.IN_REVIEW,
  APPLICATION_STATUS.REFUSED_TO_FORWARD,
  APPLICATION_STATUS.SUBMITTED_TO_ALC,
];

@Injectable()
export class ApplicationProposalService {
  private logger: Logger = new Logger(ApplicationProposalService.name);

  constructor(
    @InjectRepository(ApplicationProposal)
    private applicationProposalRepository: Repository<ApplicationProposal>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
    private alcsApplicationService: AlcsApplicationService,
    private applicationTypeService: ApplicationTypeService,
    private localGovernmentService: LocalGovernmentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFail(fileNumber: string) {
    const application = await this.applicationProposalRepository.findOne({
      where: {
        fileNumber,
      },
    });
    if (!application) {
      throw new Error('Failed to find document');
    }
    return application;
  }

  async create(type: string, createdBy: User) {
    const alcsApplicationNumber = await firstValueFrom(
      this.alcsApplicationService.generateFileNumber(),
    );

    const initialStatus = await this.applicationStatusRepository.findOne({
      where: {
        code: 'PROG',
      },
    });

    if (!initialStatus) {
      throw new BaseServiceException(
        'Failed to load In Progress Status for Creating Application',
      );
    }

    const application = new ApplicationProposal({
      fileNumber: alcsApplicationNumber.fileNumber,
      status: initialStatus,
      typeCode: type,
      createdBy,
    });
    await this.applicationProposalRepository.save(application);

    return alcsApplicationNumber.fileNumber;
  }

  async update(fileNumber: string, updateDto: ApplicationProposalUpdateDto) {
    const application = await this.getOrFail(fileNumber);

    application.applicant = updateDto.applicant; // TODO is this still a thing?
    application.typeCode = updateDto.typeCode || application.typeCode;
    application.localGovernmentUuid = updateDto.localGovernmentUuid;
    application.returnedComment = updateDto.returnedComment;
    application.hasOtherParcelsInCommunity =
      updateDto.hasOtherParcelsInCommunity;

    this.setLandUseFields(application, updateDto);
    this.setNFUFields(application, updateDto);
    this.setTURFields(application, updateDto);

    await this.applicationProposalRepository.save(application);

    return this.getOrFail(application.fileNumber);
  }

  async setPrimaryContact(fileNumber: string, primaryContactUuid: string) {
    const application = await this.getOrFail(fileNumber);
    application.primaryContactOwnerUuid = primaryContactUuid;
    await this.applicationProposalRepository.save(application);
    return this.getOrFail(application.fileNumber);
  }

  private setLandUseFields(
    application: ApplicationProposal,
    updateDto: ApplicationProposalUpdateDto,
  ) {
    application.parcelsAgricultureDescription =
      updateDto.parcelsAgricultureDescription;
    application.parcelsAgricultureImprovementDescription =
      updateDto.parcelsAgricultureImprovementDescription;
    application.parcelsNonAgricultureUseDescription =
      updateDto.parcelsNonAgricultureUseDescription;
    application.northLandUseType = updateDto.northLandUseType;
    application.northLandUseTypeDescription =
      updateDto.northLandUseTypeDescription;
    application.eastLandUseType = updateDto.eastLandUseType;
    application.eastLandUseTypeDescription =
      updateDto.eastLandUseTypeDescription;
    application.southLandUseType = updateDto.southLandUseType;
    application.southLandUseTypeDescription =
      updateDto.southLandUseTypeDescription;
    application.westLandUseType = updateDto.westLandUseType;
    application.westLandUseTypeDescription =
      updateDto.westLandUseTypeDescription;

    return application;
  }

  async submitToLg(application: ApplicationProposal) {
    await this.updateStatus(application, APPLICATION_STATUS.SUBMITTED_TO_LG);
  }

  async updateStatus(
    application: ApplicationProposal,
    statusCode: APPLICATION_STATUS,
  ) {
    const status = await this.applicationStatusRepository.findOneOrFail({
      where: {
        code: statusCode,
      },
    });

    application.status = status;
    //Use save to trigger subscriber
    await this.applicationProposalRepository.save(application);
  }

  async submitToAlcs(
    application: ValidatedApplication,
    applicationReview?: CompletedApplicationProposalReview,
  ) {
    let submittedApp: ApplicationGrpcResponse | null = null;

    const mappedReview: ApplicationReviewGrpc | undefined = applicationReview
      ? {
          localGovernmentFileNumber:
            applicationReview.localGovernmentFileNumber,
          firstName: applicationReview.firstName,
          lastName: applicationReview.lastName,
          position: applicationReview.position,
          department: applicationReview.department,
          phoneNumber: applicationReview.phoneNumber,
          email: applicationReview.email,
          isOCPDesignation: applicationReview.isOCPDesignation,
          OCPBylawName: applicationReview.OCPBylawName,
          OCPDesignation: applicationReview.OCPDesignation,
          OCPConsistent: applicationReview.OCPConsistent,
          isSubjectToZoning: applicationReview.isSubjectToZoning,
          zoningBylawName: applicationReview.zoningBylawName,
          zoningDesignation: applicationReview.zoningDesignation,
          zoningMinimumLotSize: applicationReview.zoningMinimumLotSize,
          isZoningConsistent: applicationReview.isZoningConsistent,
          isAuthorized: applicationReview.isAuthorized,
        }
      : undefined;

    try {
      submittedApp = await lastValueFrom(
        this.alcsApplicationService.create({
          fileNumber: application.fileNumber,
          applicant: application.applicant,
          localGovernmentUuid: application.localGovernmentUuid,
          typeCode: application.typeCode,
          dateSubmittedToAlc: Date.now().toString(),
          documents: application.documents.map((d) => ({
            type: d.type!, //TODO: Do we verify this?
            documentUuid: d.document.alcsDocumentUuid,
            description: d.description ?? undefined,
          })),
          statusHistory: application.statusHistory.map((history) => ({
            ...history,
            time: history.time.toString(10),
          })),
          applicationReview: mappedReview,
          submittedApplication: {
            ...application,
            nfuPurpose: application.nfuPurpose ?? undefined,
            nfuOutsideLands: application.nfuOutsideLands ?? undefined,
            nfuProjectDurationUnit:
              application.nfuProjectDurationUnit ?? undefined,
            nfuAgricultureSupport:
              application.nfuAgricultureSupport ?? undefined,
            nfuWillImportFill: application.nfuWillImportFill ?? undefined,
            nfuFillTypeDescription:
              application.nfuFillTypeDescription ?? undefined,
            nfuFillOriginDescription:
              application.nfuFillOriginDescription ?? undefined,
            nfuHectares: application.nfuHectares
              ? application.nfuHectares.toString(10)
              : undefined,
            nfuTotalFillPlacement: application.nfuTotalFillPlacement
              ? application.nfuTotalFillPlacement.toString(10)
              : undefined,
            nfuMaxFillDepth: application.nfuMaxFillDepth
              ? application.nfuMaxFillDepth.toString(10)
              : undefined,
            nfuFillVolume: application.nfuFillVolume
              ? application.nfuFillVolume.toString(10)
              : undefined,
            nfuProjectDurationAmount: application.nfuProjectDurationAmount
              ? application.nfuProjectDurationAmount.toString(10)
              : undefined,
            turPurpose: application.turPurpose ?? undefined,
            turOutsideLands: application.turOutsideLands ?? undefined,
            turAgriculturalActivities:
              application.turAgriculturalActivities ?? undefined,
            turReduceNegativeImpacts:
              application.turReduceNegativeImpacts ?? undefined,
            turTotalCorridorArea: application.turTotalCorridorArea
              ? application.turTotalCorridorArea.toString(10)
              : undefined,
          },
        }),
      );
    } catch (ex) {
      this.logger.error(ex);

      //TODO set failed status here?

      throw new BaseServiceException(
        `Failed to submit application: ${application.fileNumber}`,
      );
    }

    return submittedApp;
  }

  getByUser(user: User) {
    return this.applicationProposalRepository.find({
      where: {
        createdBy: {
          uuid: user.uuid,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  getForGovernment(localGovernment: LocalGovernment) {
    return this.applicationProposalRepository.find({
      where: [
        //Owns
        {
          createdBy: {
            bceidBusinessGuid: localGovernment.bceidBusinessGuid,
          },
        },
        //Local Government
        {
          localGovernmentUuid: localGovernment.uuid,
          status: {
            code: In(LG_VISIBLE_STATUSES),
          },
        },
      ],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getForGovernmentByFileId(
    fileNumber: string,
    localGovernment: LocalGovernment,
  ) {
    const existingApplication =
      await this.applicationProposalRepository.findOne({
        where: [
          //Owns
          {
            fileNumber,
            createdBy: {
              bceidBusinessGuid: localGovernment.bceidBusinessGuid,
            },
          },
          //Local Government
          {
            fileNumber,
            localGovernmentUuid: localGovernment.uuid,
            status: {
              code: In(LG_VISIBLE_STATUSES),
            },
          },
        ],
        order: {
          updatedAt: 'DESC',
          owners: {
            parcels: {
              purchasedDate: 'ASC',
            },
          },
        },
        relations: {
          documents: {
            document: true,
          },
          owners: {
            type: true,
            corporateSummary: true,
            parcels: true,
          },
        },
      });

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Failed to load application with File ID ${fileNumber}`,
      );
    }

    return existingApplication;
  }

  getByFileId(fileNumber: string, user: User) {
    return this.applicationProposalRepository.findOne({
      where: {
        fileNumber,
        createdBy: {
          uuid: user.uuid,
        },
      },
      relations: {
        documents: {
          document: true,
        },
        owners: {
          type: true,
          corporateSummary: true,
          parcels: true,
        },
      },
    });
  }

  async getIfCreator(fileNumber: string, user: User) {
    const existingApplication = await this.getByFileId(fileNumber, user);
    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Failed to load application with File ID ${fileNumber}`,
      );
    }
    return existingApplication;
  }

  async verifyAccess(fileId: string, user: User) {
    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (localGovernment) {
        return await this.getForGovernmentByFileId(fileId, localGovernment);
      }
    }

    return await this.getIfCreator(fileId, user);
  }

  async mapToDTOs(
    apps: ApplicationProposal[],
    user: User,
    userGovernment?: LocalGovernment,
  ) {
    const types = await this.applicationTypeService.list();
    return apps.map((app) => ({
      ...this.mapper.map(app, ApplicationProposal, ApplicationProposalDto),
      type: types.find((type) => type.code === app.typeCode)!.label,
      canEdit: [
        APPLICATION_STATUS.IN_PROGRESS,
        APPLICATION_STATUS.INCOMPLETE,
        APPLICATION_STATUS.WRONG_GOV,
      ].includes(app.status.code as APPLICATION_STATUS),
      canView: app.status.code !== APPLICATION_STATUS.CANCELLED,
      canReview:
        [
          APPLICATION_STATUS.SUBMITTED_TO_LG,
          APPLICATION_STATUS.IN_REVIEW,
        ].includes(app.status.code as APPLICATION_STATUS) &&
        userGovernment &&
        userGovernment.uuid === app.localGovernmentUuid,
    }));
  }

  async mapToDetailedDTO(
    application: ApplicationProposal,
    userGovernment?: LocalGovernment,
  ) {
    const types = await this.applicationTypeService.list();
    const mappedApp = this.mapper.map(
      application,
      ApplicationProposal,
      ApplicationProposalDetailedDto,
    );
    return {
      ...mappedApp,
      type: types.find((type) => type.code === application.typeCode)!.label,
      canEdit: [
        APPLICATION_STATUS.IN_PROGRESS,
        APPLICATION_STATUS.INCOMPLETE,
        APPLICATION_STATUS.WRONG_GOV,
      ].includes(application.status.code as APPLICATION_STATUS),
      canView: application.status.code !== APPLICATION_STATUS.CANCELLED,
      canReview:
        [
          APPLICATION_STATUS.SUBMITTED_TO_LG,
          APPLICATION_STATUS.IN_REVIEW,
        ].includes(application.status.code as APPLICATION_STATUS) &&
        userGovernment &&
        userGovernment.uuid === application.localGovernmentUuid,
    };
  }

  async cancel(application: ApplicationProposal) {
    await this.updateStatus(application, APPLICATION_STATUS.CANCELLED);
  }

  private setNFUFields(
    application: ApplicationProposal,
    updateDto: ApplicationProposalUpdateDto,
  ) {
    application.nfuHectares = updateDto.nfuHectares || application.nfuHectares;
    application.nfuPurpose = updateDto.nfuPurpose || application.nfuPurpose;
    application.nfuOutsideLands =
      updateDto.nfuOutsideLands || application.nfuOutsideLands;
    application.nfuAgricultureSupport =
      updateDto.nfuAgricultureSupport || application.nfuAgricultureSupport;
    application.nfuWillImportFill =
      updateDto.nfuWillImportFill !== undefined
        ? updateDto.nfuWillImportFill
        : application.nfuWillImportFill;
    application.nfuTotalFillPlacement =
      updateDto.nfuTotalFillPlacement || application.nfuTotalFillPlacement;
    application.nfuMaxFillDepth =
      updateDto.nfuMaxFillDepth || application.nfuMaxFillDepth;
    application.nfuFillVolume =
      updateDto.nfuFillVolume || application.nfuFillVolume;
    application.nfuProjectDurationUnit =
      updateDto.nfuProjectDurationUnit || application.nfuProjectDurationUnit;
    application.nfuProjectDurationAmount =
      updateDto.nfuProjectDurationAmount ||
      application.nfuProjectDurationAmount;
    application.nfuFillTypeDescription =
      updateDto.nfuFillTypeDescription || application.nfuFillTypeDescription;
    application.nfuFillOriginDescription =
      updateDto.nfuFillOriginDescription ||
      application.nfuFillOriginDescription;

    return application;
  }

  private setTURFields(
    application: ApplicationProposal,
    updateDto: ApplicationProposalUpdateDto,
  ) {
    application.turPurpose = updateDto.turPurpose || application.turPurpose;
    application.turAgriculturalActivities =
      updateDto.turAgriculturalActivities ||
      application.turAgriculturalActivities;
    application.turReduceNegativeImpacts =
      updateDto.turReduceNegativeImpacts ||
      application.turReduceNegativeImpacts;
    application.turOutsideLands =
      updateDto.turOutsideLands || application.turOutsideLands;
    application.turTotalCorridorArea =
      updateDto.turTotalCorridorArea || application.turTotalCorridorArea;
    application.turAllOwnersNotified =
      updateDto.turAllOwnersNotified !== undefined
        ? updateDto.turAllOwnersNotified
        : application.turAllOwnersNotified;
    return application;
  }
}
