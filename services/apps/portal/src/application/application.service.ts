import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { AlcsApplicationService } from '../alcs/application-grpc/alcs-appliation.service';
import { ApplicationGrpc } from '../alcs/application-grpc/alcs-application.message.interface';
import { BaseServiceException } from '../common/exceptions/base.exception';
import { User } from '../user/user.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import {
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

  async create(createdBy: User) {
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
    const application = await this.update(fileNumber, data);
    let submittedApp: ApplicationGrpc | null = null;

    try {
      submittedApp = await lastValueFrom(
        this.alcsApplicationService.create({
          fileNumber: fileNumber,
          applicant: application.applicant!,
          localGovernmentUuid: application.localGovernmentUuid!,
          typeCode: 'NARU',
          dateSubmittedToAlc: Date.now().toString(),
        }),
      );
    } catch (ex) {
      this.logger.error(
        `Portal -> ApplicationService -> submitToAlcs: failed to submit to ALCS ${fileNumber}`,
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
}
