import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../alcs/application/application-document/application-document-code.entity';
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionReview } from '../application-submission-review/application-submission-review.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ValidatedApplicationSubmission } from './application-submission-validator.service';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';
import { ApplicationSubmission } from './application-submission.entity';
import { GenerateSubmissionDocumentService } from './generate-submission-document/generate-submission-document.service';

const LG_VISIBLE_STATUSES = [
  APPLICATION_STATUS.SUBMITTED_TO_LG,
  APPLICATION_STATUS.IN_REVIEW,
  APPLICATION_STATUS.REFUSED_TO_FORWARD,
  APPLICATION_STATUS.SUBMITTED_TO_ALC,
];

@Injectable()
export class ApplicationSubmissionService {
  private logger: Logger = new Logger(ApplicationSubmissionService.name);

  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationDocumentService: ApplicationDocumentService,
    @Inject(forwardRef(() => GenerateSubmissionDocumentService))
    private submissionDocumentGenerationService: GenerateSubmissionDocumentService,
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

    await this.applicationSubmissionRepository.save(applicationSubmission);

    return this.getOrFailByFileNumber(applicationSubmission.fileNumber);
  }

  async setPrimaryContact(fileNumber: string, primaryContactUuid: string) {
    const application = await this.getOrFailByFileNumber(fileNumber);
    application.primaryContactOwnerUuid = primaryContactUuid;
    await this.applicationSubmissionRepository.save(application);
    return this.getOrFailByFileNumber(application.fileNumber);
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

      await this.generateAndAttachSubmissionPdfSilent(
        application.fileNumber,
        user,
      );
    } catch (ex) {
      this.logger.error(ex);
      throw new BaseServiceException(
        `Failed to submit application: ${application.fileNumber}`,
      );
    }

    return submittedApp;
  }

  private async generateAndAttachSubmissionPdfSilent(
    fileNumber: string,
    user: User,
  ) {
    try {
      const pdfRes = await this.submissionDocumentGenerationService.generate(
        fileNumber,
        user,
      );

      if (pdfRes.status === HttpStatus.OK) {
        await this.applicationDocumentService.attachDocumentAsBuffer({
          fileNumber: fileNumber,
          fileName: `${fileNumber}_Submission`,
          user: user,
          file: pdfRes.data,
          mimeType: 'application/pdf',
          fileSize: pdfRes.data.length,
          documentType: DOCUMENT_TYPE.SUBORIG,
          source: DOCUMENT_SOURCE.APPLICANT,
          visibilityFlags: [
            VISIBILITY_FLAG.APPLICANT,
            VISIBILITY_FLAG.COMMISSIONER,
            VISIBILITY_FLAG.GOVERNMENT,
          ],
        });
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
        updatedAt: 'DESC',
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
        updatedAt: 'DESC',
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
          updatedAt: 'DESC',
          owners: {
            parcels: {
              purchasedDate: 'ASC',
            },
          },
        },
        relations: {
          owners: {
            type: true,
            corporateSummary: {
              document: true,
            },
            parcels: true,
          },
        },
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
          updatedAt: 'DESC',
          owners: {
            parcels: {
              purchasedDate: 'ASC',
            },
          },
        },
        relations: {
          owners: {
            type: true,
            corporateSummary: {
              document: true,
            },
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

  async getByFileNumber(fileNumber: string, user: User) {
    return await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber,
        createdBy: {
          uuid: user.uuid,
        },
        isDraft: false,
      },
      relations: {
        owners: {
          type: true,
          corporateSummary: {
            document: true,
          },
          parcels: true,
        },
      },
    });
  }

  async getByUuid(uuid: string) {
    return await this.applicationSubmissionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        owners: {
          type: true,
          corporateSummary: {
            document: true,
          },
          parcels: true,
        },
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
    if (!applicationSubmission || applicationSubmission.createdBy !== user) {
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
          isDraft: true,
        },
        relations: {
          owners: {
            type: true,
            corporateSummary: {
              document: true,
            },
            parcels: true,
          },
        },
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
          owners: {
            type: true,
            corporateSummary: {
              document: true,
            },
            parcels: true,
          },
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
}
