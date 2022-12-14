import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ApplicationGrpcResponse } from '../alcs/application-grpc/alcs-application.message.interface';
import { AlcsApplicationService } from '../alcs/application-grpc/alcs-application.service';
import { ApplicationTypeService } from '../alcs/application-type/application-type.service';
import { BaseServiceException } from '../common/exceptions/base.exception';
import { User } from '../user/user.entity';
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
    //TODO: Get File Number from ALCS
    const fileNumber = Math.floor(Math.random() * 5000).toString(10);

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
      fileNumber,
      status: initialStatus,
      typeCode: type,
      createdBy,
    });
    await this.applicationRepository.save(application);

    return fileNumber;
  }

  async update(fileNumber: string, updateDto: UpdateApplicationDto) {
    const application = await this.getOrFail(fileNumber);

    application.applicant = updateDto.applicant || null;
    application.localGovernmentUuid = updateDto.localGovernmentUuid || null;

    return this.applicationRepository.save(application);
  }

  async submitToAlcs(fileNumber: string, data: ApplicationSubmitToAlcsDto) {
    await this.update(fileNumber, data);
    const application = await this.applicationRepository.findOneOrFail({
      where: { fileNumber },
      relations: { documents: true },
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
            documentUuid: d.alcsDocumentUuid,
          })),
        }),
      );
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

    //TODO set submitted status here

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

  getByFileId(fileNumber: string, user: User) {
    return this.applicationRepository.findOne({
      where: {
        fileNumber,
        createdBy: {
          uuid: user.uuid,
        },
      },
    });
  }

  async mapToDTOs(apps: Application[]) {
    const types = await this.applicationTypeService.list();
    return apps.map((app) => ({
      ...this.mapper.map(app, Application, ApplicationDto),
      type: types.find((type) => type.code === app.typeCode)!.label,
    }));
  }
}
