import { Module } from '@nestjs/common';
import { ApplicationGrpcModule } from './application-grpc/application-grpc.module';
import { ApplicationTypeService } from './application-type/application-type.service';
import { CodeController } from './code/code.controller';
import { DocumentService } from './document/document.service';
import { LocalGovernmentService } from './local-government/local-government.service';

@Module({
  imports: [ApplicationGrpcModule],
  providers: [DocumentService, LocalGovernmentService, ApplicationTypeService],
  controllers: [CodeController],
  exports: [DocumentService, LocalGovernmentService, ApplicationTypeService],
})
export class AlcsModule {}
