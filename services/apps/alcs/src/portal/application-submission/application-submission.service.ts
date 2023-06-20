import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, In, Repository } from 'typeorm';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { User } from '../../user/user.entity';
import { filterUndefined } from '../../utils/undefined';
import { ApplicationSubmissionReview } from '../application-submission-review/application-submission-review.entity';
import { GenerateReviewDocumentService } from '../pdf-generation/generate-review-document.service';
import { GenerateSubmissionDocumentService } from '../pdf-generation/generate-submission-document.service';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ValidatedApplicationSubmission } from './application-submission-validator.service';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';
import { ApplicationSubmission } from './application-submission.entity';
import { NaruSubtype } from './naru-subtype/naru-subtype.entity';

const LG_VISIBLE_STATUSES = [
  APPLICATION_STATUS.SUBMITTED_TO_LG,
  APPLICATION_STATUS.IN_REVIEW,
  APPLICATION_STATUS.REFUSED_TO_FORWARD,
  APPLICATION_STATUS.SUBMITTED_TO_ALC,
];

@Injectable()
export class ApplicationSubmissionService {
  private logger: Logger = new Logger(ApplicationSubmissionService.name);

  private DEFAULT_RELATIONS: FindOptionsRelations<ApplicationSubmission> = {
    naruSubtype: true,
    owners: {
      type: true,
      corporateSummary: {
        document: true,
      },
      parcels: true,
    },
  };

  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
    @InjectRepository(NaruSubtype)
    private naruSubtypeRepository: Repository<NaruSubtype>,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationDocumentService: ApplicationDocumentService,
    @Inject(forwardRef(() => GenerateSubmissionDocumentService))
    private submissionDocumentGenerationService: GenerateSubmissionDocumentService,
    @Inject(forwardRef(() => GenerateReviewDocumentService))
    private generateReviewDocumentService: GenerateReviewDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFailByFileNumber(fileNumber: string) {
    const application = await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber,
        isDraft: false,
      },
    });
    if (!application) {
      throw new Error('Failed to find document');
    }
    return application;
  }

  async getOrFailByUuid(uuid: string) {
    const application = await this.applicationSubmissionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        naruSubtype: true,
      },
    });
    if (!application) {
      throw new Error('Failed to find document');
    }
    return application;
  }

  async create(type: string, createdBy: User) {
    const fileNumber = await this.applicationService.generateNextFileNumber();

    await this.applicationService.create(
      {
        fileNumber,
        applicant: 'Unknown',
        typeCode: type,
        source: 'APPLICANT',
      },
      true,
      false,
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

    const applicationSubmission = new ApplicationSubmission({
      fileNumber,
      status: initialStatus,
      typeCode: type,
      createdBy,
    });
    await this.applicationSubmissionRepository.save(applicationSubmission);

    return fileNumber;
  }

  async update(
    submissionUuid: string,
    updateDto: ApplicationSubmissionUpdateDto,
  ) {
    const applicationSubmission = await this.getOrFailByUuid(submissionUuid);

    applicationSubmission.applicant = updateDto.applicant;
    applicationSubmission.typeCode =
      updateDto.typeCode || applicationSubmission.typeCode;
    applicationSubmission.localGovernmentUuid = updateDto.localGovernmentUuid;
    applicationSubmission.returnedComment = updateDto.returnedComment;
    applicationSubmission.hasOtherParcelsInCommunity =
      updateDto.hasOtherParcelsInCommunity;

    this.setLandUseFields(applicationSubmission, updateDto);
    this.setNFUFields(applicationSubmission, updateDto);
    this.setTURFields(applicationSubmission, updateDto);
    await this.setSUBDFields(applicationSubmission, updateDto);
    await this.setSoilFields(applicationSubmission, updateDto);
    this.setNARUFields(applicationSubmission, updateDto);

    await this.applicationSubmissionRepository.save(applicationSubmission);

    return this.getOrFailByFileNumber(applicationSubmission.fileNumber);
  }

  async setPrimaryContact(submissionUuid: string, primaryContactUuid: string) {
    const applicationSubmission = await this.getOrFailByUuid(submissionUuid);
    applicationSubmission.primaryContactOwnerUuid = primaryContactUuid;
    await this.applicationSubmissionRepository.save(applicationSubmission);
  }

  async submitToLg(application: ApplicationSubmission) {
    await this.updateStatus(application, APPLICATION_STATUS.SUBMITTED_TO_LG);
  }

  async updateStatus(
    applicationSubmission: ApplicationSubmission,
    statusCode: APPLICATION_STATUS,
  ) {
    const status = await this.getStatus(statusCode);

    //Load submission without relations to prevent save from crazy cascading
    const submission = await this.applicationSubmissionRepository.findOneOrFail(
      {
        where: {
          fileNumber: applicationSubmission.fileNumber,
          isDraft: false,
        },
      },
    );

    submission.status = status;
    //Use save to trigger subscriber
    await this.applicationSubmissionRepository.save(submission);
  }

  async getStatus(code: APPLICATION_STATUS) {
    return await this.applicationStatusRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async submitToAlcs(
    application: ValidatedApplicationSubmission,
    user: User,
    applicationReview?: ApplicationSubmissionReview,
  ) {
    let submittedApp: Application | null = null;

    const shouldCreateCard = applicationReview?.isAuthorized ?? true;
    try {
      submittedApp = await this.applicationService.submit(
        {
          fileNumber: application.fileNumber,
          applicant: application.applicant,
          localGovernmentUuid: application.localGovernmentUuid,
          typeCode: application.typeCode,
          statusHistory: application.statusHistory,
          dateSubmittedToAlc: new Date(),
        },
        shouldCreateCard,
      );

      this.generateAndAttachPdfs(
        application.fileNumber,
        user,
        !!applicationReview,
      );
    } catch (ex) {
      this.logger.error(ex);
      throw new BaseServiceException(
        `Failed to submit application: ${application.fileNumber}`,
      );
    }

    return submittedApp;
  }

  private async generateAndAttachPdfs(
    fileNumber: string,
    user: User,
    hasReview: boolean,
  ) {
    try {
      await this.submissionDocumentGenerationService.generateAndAttach(
        fileNumber,
        user,
      );

      if (hasReview) {
        await this.generateReviewDocumentService.generateAndAttach(
          fileNumber,
          user,
        );
      }
    } catch (e) {
      this.logger.error(`Error generating the document on submission${e}`);
    }
  }

  getByUser(user: User) {
    return this.applicationSubmissionRepository.find({
      where: {
        createdBy: {
          uuid: user.uuid,
        },
        isDraft: false,
      },
      order: {
        auditUpdatedAt: 'DESC',
      },
    });
  }

  getForGovernment(localGovernment: ApplicationLocalGovernment) {
    if (!localGovernment.bceidBusinessGuid) {
      throw new Error("Cannot load by governments that don't have guids");
    }

    return this.applicationSubmissionRepository.find({
      where: [
        //Owns
        {
          createdBy: {
            bceidBusinessGuid: localGovernment.bceidBusinessGuid,
          },
          isDraft: false,
        },
        //Local Government
        {
          localGovernmentUuid: localGovernment.uuid,
          status: {
            code: In(LG_VISIBLE_STATUSES),
          },
          isDraft: false,
        },
      ],
      order: {
        auditUpdatedAt: 'DESC',
      },
    });
  }

  async getForGovernmentByUuid(
    uuid: string,
    localGovernment: ApplicationLocalGovernment,
  ) {
    if (!localGovernment.bceidBusinessGuid) {
      throw new Error("Cannot load by governments that don't have guids");
    }

    const existingApplication =
      await this.applicationSubmissionRepository.findOne({
        where: [
          //Owns
          {
            uuid,
            createdBy: {
              bceidBusinessGuid: localGovernment.bceidBusinessGuid,
            },
            isDraft: false,
          },
          //Local Government
          {
            isDraft: false,
            uuid,
            localGovernmentUuid: localGovernment.uuid,
            status: {
              code: In(LG_VISIBLE_STATUSES),
            },
          },
        ],
        order: {
          auditUpdatedAt: 'DESC',
          owners: {
            parcels: {
              purchasedDate: 'ASC',
            },
          },
        },
        relations: this.DEFAULT_RELATIONS,
      });

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Failed to load application with uuid ${uuid}`,
      );
    }

    return existingApplication;
  }

  async getForGovernmentByFileId(
    fileNumber: string,
    localGovernment: ApplicationLocalGovernment,
  ) {
    if (!localGovernment.bceidBusinessGuid) {
      throw new Error("Cannot load by governments that don't have guids");
    }

    const existingApplication =
      await this.applicationSubmissionRepository.findOne({
        where: [
          //Owns
          {
            fileNumber,
            createdBy: {
              bceidBusinessGuid: localGovernment.bceidBusinessGuid,
            },
            isDraft: false,
          },
          //Local Government
          {
            isDraft: false,
            fileNumber,
            localGovernmentUuid: localGovernment.uuid,
            status: {
              code: In(LG_VISIBLE_STATUSES),
            },
          },
        ],
        order: {
          auditUpdatedAt: 'DESC',
          owners: {
            parcels: {
              purchasedDate: 'ASC',
            },
          },
        },
        relations: this.DEFAULT_RELATIONS,
      });

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Failed to load application with File ID ${fileNumber}`,
      );
    }

    return existingApplication;
  }

  async getByFileNumber(fileNumber: string, user: User) {
    return await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber,
        createdBy: {
          uuid: user.uuid,
        },
        isDraft: false,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByUuid(uuid: string) {
    return await this.applicationSubmissionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        ...this.DEFAULT_RELATIONS,
        createdBy: true,
        status: true,
      },
    });
  }

  async getIfCreatorByFileNumber(fileNumber: string, user: User) {
    const applicationSubmission = await this.getByFileNumber(fileNumber, user);
    if (!applicationSubmission) {
      throw new ServiceNotFoundException(
        `Failed to load application with File ID ${fileNumber}`,
      );
    }
    return applicationSubmission;
  }

  async getIfCreatorByUuid(uuid: string, user: User) {
    const applicationSubmission = await this.getByUuid(uuid);
    if (
      !applicationSubmission ||
      applicationSubmission.createdBy.uuid !== user.uuid
    ) {
      throw new ServiceNotFoundException(
        `Failed to load application with ID ${uuid}`,
      );
    }
    return applicationSubmission;
  }

  async verifyAccessByFileId(fileId: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.applicationSubmissionRepository.findOneOrFail({
        where: {
          fileNumber: fileId,
          isDraft: false,
        },
        relations: this.DEFAULT_RELATIONS,
      });
    }

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (localGovernment) {
        return await this.getForGovernmentByFileId(fileId, localGovernment);
      }
    }

    return await this.getIfCreatorByFileNumber(fileId, user);
  }

  async verifyAccessByUuid(submissionUuid: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.applicationSubmissionRepository.findOneOrFail({
        where: {
          uuid: submissionUuid,
        },
        relations: {
          ...this.DEFAULT_RELATIONS,
          status: true,
        },
      });
    }

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (localGovernment) {
        return await this.getForGovernmentByUuid(
          submissionUuid,
          localGovernment,
        );
      }
    }

    return await this.getIfCreatorByUuid(submissionUuid, user);
  }

  async mapToDTOs(
    apps: ApplicationSubmission[],
    user: User,
    userGovernment?: ApplicationLocalGovernment,
  ) {
    const types = await this.applicationService.fetchApplicationTypes();
    return apps.map((app) => ({
      ...this.mapper.map(app, ApplicationSubmission, ApplicationSubmissionDto),
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
    application: ApplicationSubmission,
    userGovernment?: ApplicationLocalGovernment,
  ) {
    const types = await this.applicationService.fetchApplicationTypes();
    const mappedApp = this.mapper.map(
      application,
      ApplicationSubmission,
      ApplicationSubmissionDetailedDto,
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

  async cancel(application: ApplicationSubmission) {
    await this.updateStatus(application, APPLICATION_STATUS.CANCELLED);
  }

  private setLandUseFields(
    application: ApplicationSubmission,
    updateDto: ApplicationSubmissionUpdateDto,
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

  private setNFUFields(
    application: ApplicationSubmission,
    updateDto: ApplicationSubmissionUpdateDto,
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
      updateDto.nfuTotalFillPlacement !== undefined
        ? updateDto.nfuTotalFillPlacement
        : application.nfuTotalFillPlacement;
    application.nfuMaxFillDepth =
      updateDto.nfuMaxFillDepth !== undefined
        ? updateDto.nfuMaxFillDepth
        : application.nfuMaxFillDepth;
    application.nfuFillVolume =
      updateDto.nfuFillVolume !== undefined
        ? updateDto.nfuFillVolume
        : application.nfuFillVolume;
    application.nfuProjectDurationUnit =
      updateDto.nfuProjectDurationUnit !== undefined
        ? updateDto.nfuProjectDurationUnit
        : application.nfuProjectDurationUnit;
    application.nfuProjectDurationAmount =
      updateDto.nfuProjectDurationAmount !== undefined
        ? updateDto.nfuProjectDurationAmount
        : application.nfuProjectDurationAmount;
    application.nfuFillTypeDescription =
      updateDto.nfuFillTypeDescription !== undefined
        ? updateDto.nfuFillTypeDescription
        : application.nfuFillTypeDescription;
    application.nfuFillOriginDescription =
      updateDto.nfuFillOriginDescription !== undefined
        ? updateDto.nfuFillOriginDescription
        : application.nfuFillOriginDescription;

    return application;
  }

  private setTURFields(
    application: ApplicationSubmission,
    updateDto: ApplicationSubmissionUpdateDto,
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

  private async setSUBDFields(
    applicationSubmission: ApplicationSubmission,
    updateDto: ApplicationSubmissionUpdateDto,
  ) {
    applicationSubmission.subdPurpose =
      updateDto.subdPurpose || applicationSubmission.subdPurpose;
    applicationSubmission.subdSuitability =
      updateDto.subdSuitability || applicationSubmission.subdSuitability;
    applicationSubmission.subdAgricultureSupport =
      updateDto.subdAgricultureSupport ||
      applicationSubmission.subdAgricultureSupport;
    applicationSubmission.subdIsHomeSiteSeverance =
      updateDto.subdIsHomeSiteSeverance !== undefined
        ? updateDto.subdIsHomeSiteSeverance
        : applicationSubmission.subdIsHomeSiteSeverance;
    applicationSubmission.subdProposedLots =
      updateDto.subdProposedLots || applicationSubmission.subdProposedLots;

    if (updateDto.subdIsHomeSiteSeverance === false) {
      const applicationUuid = await this.applicationService.getUuid(
        applicationSubmission.fileNumber,
      );
      await this.applicationDocumentService.deleteByType(
        DOCUMENT_TYPE.HOMESITE_SEVERANCE,
        applicationUuid,
      );
    }
  }

  private async setSoilFields(
    applicationSubmission: ApplicationSubmission,
    updateDto: ApplicationSubmissionUpdateDto,
  ) {
    applicationSubmission.soilIsNOIFollowUp = filterUndefined(
      updateDto.soilIsNOIFollowUp,
      applicationSubmission.soilIsNOIFollowUp,
    );
    applicationSubmission.soilNOIIDs = filterUndefined(
      updateDto.soilNOIIDs,
      applicationSubmission.soilNOIIDs,
    );
    applicationSubmission.soilHasPreviousALCAuthorization = filterUndefined(
      updateDto.soilHasPreviousALCAuthorization,
      applicationSubmission.soilHasPreviousALCAuthorization,
    );
    applicationSubmission.soilApplicationIDs = filterUndefined(
      updateDto.soilApplicationIDs,
      applicationSubmission.soilApplicationIDs,
    );
    applicationSubmission.soilPurpose = filterUndefined(
      updateDto.soilPurpose,
      applicationSubmission.soilPurpose,
    );
    applicationSubmission.soilTypeRemoved = filterUndefined(
      updateDto.soilTypeRemoved,
      applicationSubmission.soilTypeRemoved,
    );
    applicationSubmission.soilReduceNegativeImpacts = filterUndefined(
      updateDto.soilReduceNegativeImpacts,
      applicationSubmission.soilReduceNegativeImpacts,
    );
    applicationSubmission.soilToRemoveVolume = filterUndefined(
      updateDto.soilToRemoveVolume,
      applicationSubmission.soilToRemoveVolume,
    );
    applicationSubmission.soilToRemoveArea = filterUndefined(
      updateDto.soilToRemoveArea,
      applicationSubmission.soilToRemoveArea,
    );
    applicationSubmission.soilToRemoveMaximumDepth = filterUndefined(
      updateDto.soilToRemoveMaximumDepth,
      applicationSubmission.soilToRemoveMaximumDepth,
    );
    applicationSubmission.soilToRemoveAverageDepth = filterUndefined(
      updateDto.soilToRemoveAverageDepth,
      applicationSubmission.soilToRemoveAverageDepth,
    );
    applicationSubmission.soilAlreadyRemovedVolume = filterUndefined(
      updateDto.soilAlreadyRemovedVolume,
      applicationSubmission.soilAlreadyRemovedVolume,
    );
    applicationSubmission.soilAlreadyRemovedArea = filterUndefined(
      updateDto.soilAlreadyRemovedArea,
      applicationSubmission.soilAlreadyRemovedArea,
    );
    applicationSubmission.soilAlreadyRemovedMaximumDepth = filterUndefined(
      updateDto.soilAlreadyRemovedMaximumDepth,
      applicationSubmission.soilAlreadyRemovedMaximumDepth,
    );
    applicationSubmission.soilAlreadyRemovedAverageDepth = filterUndefined(
      updateDto.soilAlreadyRemovedAverageDepth,
      applicationSubmission.soilAlreadyRemovedAverageDepth,
    );
    applicationSubmission.soilToPlaceVolume = filterUndefined(
      updateDto.soilToPlaceVolume,
      applicationSubmission.soilToPlaceVolume,
    );
    applicationSubmission.soilToPlaceArea = filterUndefined(
      updateDto.soilToPlaceArea,
      applicationSubmission.soilToPlaceArea,
    );
    applicationSubmission.soilToPlaceMaximumDepth = filterUndefined(
      updateDto.soilToPlaceMaximumDepth,
      applicationSubmission.soilToPlaceMaximumDepth,
    );
    applicationSubmission.soilToPlaceAverageDepth = filterUndefined(
      updateDto.soilToPlaceAverageDepth,
      applicationSubmission.soilToPlaceAverageDepth,
    );
    applicationSubmission.soilAlreadyPlacedVolume = filterUndefined(
      updateDto.soilAlreadyPlacedVolume,
      applicationSubmission.soilAlreadyPlacedVolume,
    );
    applicationSubmission.soilAlreadyPlacedArea = filterUndefined(
      updateDto.soilAlreadyPlacedArea,
      applicationSubmission.soilAlreadyPlacedArea,
    );
    applicationSubmission.soilAlreadyPlacedMaximumDepth = filterUndefined(
      updateDto.soilAlreadyPlacedMaximumDepth,
      applicationSubmission.soilAlreadyPlacedMaximumDepth,
    );
    applicationSubmission.soilAlreadyPlacedAverageDepth = filterUndefined(
      updateDto.soilAlreadyPlacedAverageDepth,
      applicationSubmission.soilAlreadyPlacedAverageDepth,
    );
    applicationSubmission.soilProjectDurationAmount = filterUndefined(
      updateDto.soilProjectDurationAmount,
      applicationSubmission.soilProjectDurationAmount,
    );
    applicationSubmission.soilProjectDurationUnit = filterUndefined(
      updateDto.soilProjectDurationUnit,
      applicationSubmission.soilProjectDurationUnit,
    );
    applicationSubmission.soilFillTypeToPlace = filterUndefined(
      updateDto.soilFillTypeToPlace,
      applicationSubmission.soilFillTypeToPlace,
    );
    applicationSubmission.soilAlternativeMeasures = filterUndefined(
      updateDto.soilAlternativeMeasures,
      applicationSubmission.soilAlternativeMeasures,
    );

    applicationSubmission.soilIsExtractionOrMining = filterUndefined(
      updateDto.soilIsExtractionOrMining,
      applicationSubmission.soilIsExtractionOrMining,
    );

    applicationSubmission.soilHasSubmittedNotice = filterUndefined(
      updateDto.soilHasSubmittedNotice,
      applicationSubmission.soilHasSubmittedNotice,
    );

    if (
      updateDto.soilHasSubmittedNotice === false ||
      updateDto.soilIsExtractionOrMining === false
    ) {
      const applicationUuid = await this.applicationService.getUuid(
        applicationSubmission.fileNumber,
      );
      await this.applicationDocumentService.deleteByType(
        DOCUMENT_TYPE.NOTICE_OF_WORK,
        applicationUuid,
      );
    }
  }

  private setNARUFields(
    applicationSubmission: ApplicationSubmission,
    updateDto: ApplicationSubmissionUpdateDto,
  ) {
    applicationSubmission.naruSubtypeCode = filterUndefined(
      updateDto.naruSubtypeCode,
      applicationSubmission.naruSubtypeCode,
    );
    applicationSubmission.naruPurpose = filterUndefined(
      updateDto.naruPurpose,
      applicationSubmission.naruPurpose,
    );
    applicationSubmission.naruFloorArea = filterUndefined(
      updateDto.naruFloorArea,
      applicationSubmission.naruFloorArea,
    );
    applicationSubmission.naruResidenceNecessity = filterUndefined(
      updateDto.naruResidenceNecessity,
      applicationSubmission.naruResidenceNecessity,
    );
    applicationSubmission.naruLocationRationale = filterUndefined(
      updateDto.naruLocationRationale,
      applicationSubmission.naruLocationRationale,
    );
    applicationSubmission.naruInfrastructure = filterUndefined(
      updateDto.naruInfrastructure,
      applicationSubmission.naruInfrastructure,
    );
    applicationSubmission.naruExistingStructures = filterUndefined(
      updateDto.naruExistingStructures,
      applicationSubmission.naruExistingStructures,
    );
    applicationSubmission.naruWillImportFill = filterUndefined(
      updateDto.naruWillImportFill,
      applicationSubmission.naruWillImportFill,
    );
    applicationSubmission.naruFillType = filterUndefined(
      updateDto.naruFillType,
      applicationSubmission.naruFillType,
    );
    applicationSubmission.naruFillOrigin = filterUndefined(
      updateDto.naruFillOrigin,
      applicationSubmission.naruFillOrigin,
    );
    applicationSubmission.naruProjectDurationAmount = filterUndefined(
      updateDto.naruProjectDurationAmount,
      applicationSubmission.naruProjectDurationAmount,
    );
    applicationSubmission.naruProjectDurationUnit = filterUndefined(
      updateDto.naruProjectDurationUnit,
      applicationSubmission.naruProjectDurationUnit,
    );
    applicationSubmission.naruToPlaceVolume = filterUndefined(
      updateDto.naruToPlaceVolume,
      applicationSubmission.naruToPlaceVolume,
    );
    applicationSubmission.naruToPlaceArea = filterUndefined(
      updateDto.naruToPlaceArea,
      applicationSubmission.naruToPlaceArea,
    );
    applicationSubmission.naruToPlaceMaximumDepth = filterUndefined(
      updateDto.naruToPlaceMaximumDepth,
      applicationSubmission.naruToPlaceMaximumDepth,
    );
    applicationSubmission.naruToPlaceAverageDepth = filterUndefined(
      updateDto.naruToPlaceAverageDepth,
      applicationSubmission.naruToPlaceAverageDepth,
    );
  }

  async listNaruSubtypes() {
    return this.naruSubtypeRepository.find({
      select: {
        label: true,
        code: true,
      },
    });
  }
}
