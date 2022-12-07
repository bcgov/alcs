import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlcsApplicationServiceClient } from '../alcs/application-grpc/alcs-application.service.interface';
import { BaseServiceException } from '../common/exceptions/base.exception';
import { grpcClientOptions } from '../providers/grpc/grpc-client.options';
import { User } from '../user/user.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { UpdateApplicationDto } from './application.dto';
import { Application } from './application.entity';

@Injectable()
export class ApplicationService implements OnModuleInit {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
  ) {}

  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private alcsApplicationService: AlcsApplicationServiceClient;

  onModuleInit() {
    this.alcsApplicationService =
      this.client.getService<AlcsApplicationServiceClient>(
        'AlcsApplicationService',
      );
  }

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

    // TODO: call alcsGrpc here{
    await this.alcsApplicationService.create({
      fileNumber: application.fileNumber,
      applicant: application.applicant || 'grpc',
      typeCode: 'APP',
      dateSubmittedToAlc: Date.now().toString(),
      regionCode: '',
      localGovernmentUuid: '',
    });

    return fileNumber;
  }

  async update(fileNumber: string, updateDto: UpdateApplicationDto) {
    const application = await this.getOrFail(fileNumber);

    application.applicant = updateDto.applicant || null;
    application.localGovernmentUuid = updateDto.localGovernmentUuid || null;

    return this.applicationRepository.save(application);
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
