import { Module } from '@nestjs/common';
import { CodeController } from './code/code.controller';
import { DocumentService } from './document/document.service';
import { LocalGovernmentService } from './local-government/local-government.service';

@Module({
  imports: [],
  providers: [DocumentService, LocalGovernmentService],
  controllers: [CodeController],
  exports: [DocumentService, LocalGovernmentService],
})
export class AlcsModule {}
