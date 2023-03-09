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
import { CompletedApplicationReview } from '../application-review/application-review.service';
import { User } from '../user/user.entity';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ValidatedApplication } from './application-validator.service';
import {
  ApplicationDetailedDto,
  ApplicationDto,
  ApplicationUpdateDto,
} from './application.dto';
import { Application } from './application.entity';

const LG_VISIBLE_STATUSES = [
  APPLICATION_STATUS.SUBMITTED_TO_LG,
  APPLICATION_STATUS.IN_REVIEW,
  APPLICATION_STATUS.REFUSED_TO_FORWARD,
  APPLICATION_STATUS.SUBMITTED_TO_ALC,
];

@Injectable()
export class ApplicationService {
  private logger: Logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
    private alcsApplicationService: AlcsApplicationService,
    private applicationTypeService: ApplicationTypeService,
    private localGovernmentService: LocalGovernmentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFail(fileNumber: string) {
    const application = await this.applicationRepository.findOne({
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

    const application = new Application({
      fileNumber: alcsApplicationNumber.fileNumber,
      status: initialStatus,
      typeCode: type,
      createdBy,
    });
    await this.applicationRepository.save(application);

    return alcsApplicationNumber.fileNumber;
  }

  async update(fileNumber: string, updateDto: ApplicationUpdateDto) {
    const application = await this.getOrFail(fileNumber);

    application.applicant = updateDto.applicant; // TODO is this still a thing?
    application.typeCode = updateDto.typeCode || application.typeCode;
    application.localGovernmentUuid = updateDto.localGovernmentUuid;
    application.returnedComment = updateDto.returnedComment;
    application.hasOtherParcelsInCommunity =
      updateDto.hasOtherParcelsInCommunity;

    this.setLandUseFields(application, updateDto);
    this.setNFUFields(application, updateDto);

    await this.applicationRepository.save(application);

    return this.getOrFail(application.fileNumber);
  }

  async setPrimaryContact(fileNumber: string, primaryContactUuid: string) {
    const application = await this.getOrFail(fileNumber);
    application.primaryContactOwnerUuid = primaryContactUuid;
    await this.applicationRepository.save(application);
    return this.getOrFail(application.fileNumber);
  }

  private setLandUseFields(
    application: Application,
    updateDto: ApplicationUpdateDto,
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

  async submitToLg(application: Application) {
    await this.updateStatus(application, APPLICATION_STATUS.SUBMITTED_TO_LG);
  }

  async updateStatus(application: Application, statusCode: APPLICATION_STATUS) {
    const status = await this.applicationStatusRepository.findOneOrFail({
      where: {
        code: statusCode,
      },
    });

    application.status = status;
    //Use save to trigger subscriber
    await this.applicationRepository.save(application);
  }

  async submitToAlcs(
    application: ValidatedApplication,
    applicationReview?: CompletedApplicationReview,
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
          },
        }),
      );

      await this.updateStatus(application, APPLICATION_STATUS.SUBMITTED_TO_ALC);
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
    return this.applicationRepository.find({
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
    return this.applicationRepository.find({
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
    const existingApplication = await this.applicationRepository.findOne({
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
    return this.applicationRepository.findOne({
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
    apps: Application[],
    user: User,
    userGovernment?: LocalGovernment,
  ) {
    const types = await this.applicationTypeService.list();
    return apps.map((app) => ({
      ...this.mapper.map(app, Application, ApplicationDto),
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
    application: Application,
    userGovernment?: LocalGovernment,
  ) {
    const types = await this.applicationTypeService.list();
    const mappedApp = this.mapper.map(
      application,
      Application,
      ApplicationDetailedDto,
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

  async cancel(application: Application) {
    await this.updateStatus(application, APPLICATION_STATUS.CANCELLED);
  }

  private setNFUFields(
    application: Application,
    updateDto: ApplicationUpdateDto,
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
}
