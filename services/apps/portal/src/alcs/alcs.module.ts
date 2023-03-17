import { Module } from '@nestjs/common';
import { CodeController } from './code/code.controller';
import { AlcsDocumentModule } from './document-grpc/alcs-document.module';
import { LocalGovernmentService } from './local-government/local-government.service';
import { SubmissionTypeService } from './submission-type/submission-type.service';

@Module({
  imports: [AlcsDocumentModule],
  providers: [LocalGovernmentService, SubmissionTypeService],
  controllers: [CodeController],
  exports: [LocalGovernmentService, AlcsDocumentModule, SubmissionTypeService],
})
export class AlcsModule {}
