import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FileNumberService } from '../../file-number/file-number.service';
import { ApplicationFileNumberGenerateGrpcResponse } from './alcs-application.message.interface';
import {
  AlcsApplicationService,
  GRPC_APPLICATION_SERVICE_NAME,
} from './alcs-application.service.interface';

@Controller('application-grpc')
export class ApplicationGrpcController implements AlcsApplicationService {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(private fileNumberService: FileNumberService) {}

  @GrpcMethod(GRPC_APPLICATION_SERVICE_NAME, 'generateFileNumber')
  async generateFileNumber(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ApplicationFileNumberGenerateGrpcRequest: any,
  ): Promise<ApplicationFileNumberGenerateGrpcResponse> {
    return {
      fileNumber: await this.fileNumberService.generateNextFileNumber(),
    };
  }
}
