import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ApplicationGrpcResponse } from '../alcs/application-grpc/alcs-application.message.interface';
import { AlcsApplicationService } from '../alcs/application-grpc/alcs-application.service';
import { ApplicationTypeService } from '../alcs/application-type/application-type.service';
import { LocalGovernment } from '../alcs/local-government/local-government.service';
import { User } from '../user/user.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import {
  ApplicationDto,
  ApplicationSubmitToAlcsDto,
  UpdateApplicationDto,
} from './application.dto';
import { Application } from './application.entity';

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

    application.applicant = updateDto.applicant || null;
    application.localGovernmentUuid = updateDto.localGovernmentUuid || null;
    application.typeCode = updateDto.typeCode || application.typeCode;

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

  async submitToAlcs(fileNumber: string, data: ApplicationSubmitToAlcsDto) {
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
        //Submitted
        {
          localGovernmentUuid: localGovernment.uuid,
          status: {
            code: APPLICATION_STATUS.SUBMITTED_TO_LG,
          },
        },
        //In Review
        {
          localGovernmentUuid: localGovernment.uuid,
          status: {
            code: APPLICATION_STATUS.IN_REVIEW,
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
        //Submitted
        {
          fileNumber,
          localGovernmentUuid: localGovernment.uuid,
          status: {
            code: APPLICATION_STATUS.SUBMITTED_TO_LG,
          },
        },
        //In Review
        {
          fileNumber,
          localGovernmentUuid: localGovernment.uuid,
          status: {
            code: APPLICATION_STATUS.IN_REVIEW,
          },
        },
      ],
      order: {
        updatedAt: 'DESC',
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

  async verifyAccess(fileNumber: string, user: User) {
    await this.getIfCreator(fileNumber, user);
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
      canEdit: app.status.code == APPLICATION_STATUS.IN_PROGRESS,
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
