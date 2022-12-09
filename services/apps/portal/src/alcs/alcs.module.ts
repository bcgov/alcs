import { Module } from '@nestjs/common';
import { ApplicationGrpcModule } from './application-grpc/application-grpc.module';
import { CodeController } from './code/code.controller';
import { AlcsDocumentModule } from './document-grpc/alcs-document.module';
import { DocumentService } from './document/document.service';
import { LocalGovernmentService } from './local-government/local-government.service';

@Module({
  imports: [ApplicationGrpcModule, AlcsDocumentModule],
  providers: [DocumentService, LocalGovernmentService],
  controllers: [CodeController],
  exports: [DocumentService, LocalGovernmentService],
})
export class AlcsModule {}
