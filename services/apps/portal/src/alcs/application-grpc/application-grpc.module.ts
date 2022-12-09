import { Module } from '@nestjs/common';
import { AlcsApplicationService } from './alcs-application.service';
import { AlcsApplicationDocumentService } from './application-document/alcs-application-document.service';

@Module({
  providers: [AlcsApplicationService, AlcsApplicationDocumentService],
  exports: [AlcsApplicationService, AlcsApplicationDocumentService],
})
export class ApplicationGrpcModule {}
