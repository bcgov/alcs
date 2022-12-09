import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationLocalGovernmentService } from '../application/application-code/application-local-government/application-local-government.service';
import { CreateApplicationServiceDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import {
  ApplicationCreateGrpc,
  ApplicationGrpc,
} from './alcs-application.message.interface';
import { GRPC_APPLICATION_SERVICE_NAME } from './alcs-application.service.interface';

@Controller('application-grpc')
export class ApplicationGrpcController {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @GrpcMethod(GRPC_APPLICATION_SERVICE_NAME, 'create')
  async create(data: ApplicationCreateGrpc): Promise<ApplicationGrpc> {
    this.logger.debug('ALCS-> GRPC -> AlcsApplicationService -> create');

    const localGovernment = await this.localGovernmentService.getByUuid(
      data.localGovernmentUuid,
    );

    const application = await this.applicationService.create({
      ...data,
      regionCode: localGovernment?.preferredRegion.code,
      dateSubmittedToAlc: new Date(Number(data.dateSubmittedToAlc)),
    } as CreateApplicationServiceDto);

    return this.mapper.mapAsync(application, Application, ApplicationGrpc);
  }
}
