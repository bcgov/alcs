import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceAndEnforcement } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from './compliance-and-enforcement.service';
import { ComplianceAndEnforcementController } from './compliance-and-enforcement.controller';
import { ComplianceAndEnforcementProfile } from './compliance-and-enforcement.automapper.profile';
import { ComplianceAndEnforcementSubmitterController } from './submitter/submitter.controller';
import { ComplianceAndEnforcementSubmitterProfile } from './submitter/submitter.automapper.profile';
import { ComplianceAndEnforcementSubmitterService } from './submitter/submitter.service';
import { ComplianceAndEnforcementSubmitter } from './submitter/submitter.entity';
import { ComplianceAndEnforcementDocumentController } from './document/document.controller';
import { ComplianceAndEnforcementDocumentService } from './document/document.service';
import { ComplianceAndEnforcementDocumentProfile } from './document/document.automapper.profile';
import { ComplianceAndEnforcementDocument } from './document/document.entity';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentModule } from '../../document/document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceAndEnforcement,
      ComplianceAndEnforcementSubmitter,
      ComplianceAndEnforcementDocument,
      DocumentCode,
    ]),
    DocumentModule,
  ],
  controllers: [
    ComplianceAndEnforcementController,
    ComplianceAndEnforcementSubmitterController,
    ComplianceAndEnforcementDocumentController,
  ],
  providers: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementDocumentService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
    ComplianceAndEnforcementDocumentProfile,
  ],
  exports: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementDocumentService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
    ComplianceAndEnforcementDocumentProfile,
  ],
})
export class ComplianceAndEnforcementModule {}
