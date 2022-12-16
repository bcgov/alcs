import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationLocalGovernmentService } from '../application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentCreateDto } from '../application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../application/application-document/application-document.service';
import { CreateApplicationServiceDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import {
  ApplicationCreateGrpcRequest,
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';
import {
  AlcsApplicationService,
  GRPC_APPLICATION_SERVICE_NAME,
} from './alcs-application.service.interface';

@Controller('application-grpc')
export class ApplicationGrpcController implements AlcsApplicationService {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @GrpcMethod(GRPC_APPLICATION_SERVICE_NAME, 'create')
  async create(
    data: ApplicationCreateGrpcRequest,
  ): Promise<ApplicationGrpcResponse> {
    this.logger.debug('ALCS-> GRPC -> AlcsApplicationService -> create');

    const localGovernment = await this.localGovernmentService.getByUuid(
      data.localGovernmentUuid,
    );

    const application = await this.applicationService.create({
      ...data,
      regionCode: localGovernment?.preferredRegion.code,
      dateSubmittedToAlc: new Date(Number(data.dateSubmittedToAlc)),
    } as CreateApplicationServiceDto);

    await this.applicationDocumentService.attachExternalDocuments(
      application.fileNumber,
      data.documents as ApplicationDocumentCreateDto[],
    );

    return this.mapper.mapAsync(
      application,
      Application,
      ApplicationGrpcResponse,
    );
  }

  @GrpcMethod(GRPC_APPLICATION_SERVICE_NAME, 'generateFileNumber')
  async generateFileNumber(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ApplicationFileNumberGenerateGrpcRequest: any,
  ): Promise<ApplicationFileNumberGenerateGrpcResponse> {
    return {
      fileNumber: await this.applicationService.generateNextFileNumber(),
    };
  }
}
