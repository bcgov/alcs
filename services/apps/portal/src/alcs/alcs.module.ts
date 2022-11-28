import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { CodeController } from './code/code.controller';
import { DocumentService } from './document/document.service';
import { LocalGovernmentService } from './local-government/local-government.service';

@Module({
  providers: [DocumentService, LocalGovernmentService],
  imports: [AuthorizationModule],
  controllers: [CodeController],
  exports: [DocumentService, LocalGovernmentService],
})
export class AlcsModule {}
