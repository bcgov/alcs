import { Module } from '@nestjs/common';
import { AlcsApplicationService } from './alcs-application.service';

@Module({
  providers: [AlcsApplicationService],
  exports: [AlcsApplicationService],
})
export class ApplicationGrpcModule {}
