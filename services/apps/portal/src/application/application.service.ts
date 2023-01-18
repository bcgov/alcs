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
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import {
  ApplicationDto,
  ApplicationSubmitToAlcsDto,
  UpdateApplicationDto,
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

  async update(fileNumber: string, updateDto: UpdateApplicationDto) {
    const application = await this.getOrFail(fileNumber);

    application.applicant = updateDto.applicant || application.applicant;
    application.localGovernmentUuid =
      updateDto.localGovernmentUuid || application.localGovernmentUuid;
    application.typeCode = updateDto.typeCode || application.typeCode;
    application.returnedComment =
      updateDto.returnedComment || application.returnedComment;

    await this.applicationRepository.save(application);

    return this.getOrFail(application.fileNumber);
  }

  async submitToLg(fileNumber: string) {
    await this.updateStatus(fileNumber, APPLICATION_STATUS.SUBMITTED_TO_LG);
  }

  async updateStatus(fileNumber: string, statusCode: APPLICATION_STATUS) {
    const status = await this.applicationStatusRepository.findOneOrFail({
      where: {
        code: statusCode,
      },
    });

    return await this.applicationRepository.update(
      {
        fileNumber,
      },
      {
        status,
      },
    );
  }

  async submitToAlcs(
    fileNumber: string,
    data: ApplicationSubmitToAlcsDto,
    applicationReview?: CompletedApplicationReview,
  ) {
    await this.update(fileNumber, data);

    const application = await this.applicationRepository.findOneOrFail({
      where: { fileNumber },
      relations: {
        documents: {
          document: true,
        },
      },
    });

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
          fileNumber: fileNumber,
          applicant: application.applicant!,
          localGovernmentUuid: application.localGovernmentUuid!,
          typeCode: application.typeCode,
          dateSubmittedToAlc: Date.now().toString(),
          documents: application?.documents.map((d) => ({
            type: d.type,
            documentUuid: d.document.alcsDocumentUuid,
          })),
          applicationReview: mappedReview,
        }),
      );

      await this.updateStatus(fileNumber, APPLICATION_STATUS.SUBMITTED_TO_ALC);
    } catch (ex) {
      this.logger.error(
        `Portal -> ApplicationService -> submitToAlcs: failed to submit to ALCS ${fileNumber}`,
        ex,
      );

      //TODO set failed status here?

      throw new BaseServiceException(
        `Failed to submit application: ${fileNumber}`,
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
      },
      relations: {
        documents: {
          document: true,
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

  async cancel(application: Application) {
    await this.updateStatus(
      application.fileNumber,
      APPLICATION_STATUS.CANCELLED,
    );
  }
}
