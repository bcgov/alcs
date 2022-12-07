import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationService } from '../application/application.service';
import {
  ApplicationByNumberGrpc,
  ApplicationGrpc,
  CardGrpc,
} from './alcs-application.message.interface';

@Controller('application-grpc')
export class ApplicationGrpcController {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(private applicationService: ApplicationService) {}

  @GrpcMethod('GrpcApplicationService', 'get')
  async grpcGet(data: ApplicationByNumberGrpc): Promise<ApplicationGrpc> {
    const application = await this.applicationService.getOrFail(
      data.fileNumber,
    );

    return {
      fileNumber: application.fileNumber,
      applicant: application.applicant,
      activeDays: 0,
      pausedDays: 0,
      paused: false,
      dateSubmittedToAlc: Date.now(),
      card: {} as CardGrpc,
    } as ApplicationGrpc;
  }
}
