import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../alcs/application/application.module';
import { DocumentModule } from '../../document/document.module';
import { ApplicationDocumentController } from '../application-document/application-document.controller';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';

@Module({
  imports: [DocumentModule, ApplicationModule, ApplicationSubmissionModule],
  controllers: [ApplicationDocumentController],
  providers: [],
  exports: [],
})
export class PortalApplicationDocumentModule {}
