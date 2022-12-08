import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateApplicationServiceDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import {
  ApplicationCreateGrpc,
  ApplicationGrpc,
} from './alcs-application.message.interface';

@Controller('application-grpc')
export class ApplicationGrpcController {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @GrpcMethod('AlcsApplicationService', 'create')
  async create(data: ApplicationCreateGrpc): Promise<ApplicationGrpc> {
    this.logger.debug('ALCS-> GRPC -> AlcsApplicationService -> create');
    const application = await this.applicationService.create({
      ...data,
      dateSubmittedToAlc: new Date(Number(data.dateSubmittedToAlc)),
    } as CreateApplicationServiceDto);

    return this.mapper.map(application, Application, ApplicationGrpc);
  }
}
