import { Module } from '@nestjs/common';
import { CodeController } from './code/code.controller';
import { AlcsDocumentModule } from './document-grpc/alcs-document.module';
import { LocalGovernmentService } from './local-government/local-government.service';

@Module({
  imports: [AlcsDocumentModule],
  providers: [LocalGovernmentService],
  controllers: [CodeController],
  exports: [LocalGovernmentService, AlcsDocumentModule],
})
export class AlcsModule {}
