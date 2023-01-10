import { Module } from '@nestjs/common';
import { ApplicationGrpcModule } from './application-grpc/application-grpc.module';
import { ApplicationTypeService } from './application-type/application-type.service';
import { CodeController } from './code/code.controller';
import { AlcsDocumentModule } from './document-grpc/alcs-document.module';
import { LocalGovernmentService } from './local-government/local-government.service';
import { SubmissionTypeService } from './submission-type/submission-type.service';

@Module({
  imports: [ApplicationGrpcModule, AlcsDocumentModule],
  providers: [
    LocalGovernmentService,
    ApplicationTypeService,
    SubmissionTypeService,
  ],
  controllers: [CodeController],
  exports: [
    LocalGovernmentService,
    ApplicationTypeService,
    AlcsDocumentModule,
    SubmissionTypeService,
  ],
})
export class AlcsModule {}
