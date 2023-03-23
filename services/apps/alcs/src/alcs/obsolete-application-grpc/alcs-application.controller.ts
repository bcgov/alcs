import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationService } from '../application/application.service';
import { ApplicationFileNumberGenerateGrpcResponse } from './alcs-application.message.interface';
import {
  AlcsApplicationService,
  GRPC_APPLICATION_SERVICE_NAME,
} from './alcs-application.service.interface';

@Controller('application-grpc')
export class ApplicationGrpcController implements AlcsApplicationService {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(private applicationService: ApplicationService) {}

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
