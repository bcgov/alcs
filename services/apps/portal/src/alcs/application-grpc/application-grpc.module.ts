import { Module } from '@nestjs/common';
import { AlcsApplicationService } from './alcs-appliation.service';

@Module({
  providers: [AlcsApplicationService],
  exports: [AlcsApplicationService],
})
export class ApplicationGrpcModule {}
