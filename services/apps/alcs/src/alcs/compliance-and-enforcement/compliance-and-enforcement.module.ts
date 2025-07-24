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
import { ComplianceAndEnforcementPropertyController } from './property/property.controller';
import { ComplianceAndEnforcementPropertyProfile } from './property/property.automapper.profile';
import { ComplianceAndEnforcementPropertyService } from './property/property.service';
import { ComplianceAndEnforcementProperty } from './property/property.entity';
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
      ComplianceAndEnforcementProperty,
      ComplianceAndEnforcementDocument,
      DocumentCode,
    ]),
    DocumentModule,
  ],
  controllers: [
    ComplianceAndEnforcementController,
    ComplianceAndEnforcementSubmitterController,
    ComplianceAndEnforcementPropertyController,
    ComplianceAndEnforcementDocumentController,
  ],
  providers: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementPropertyService,
    ComplianceAndEnforcementDocumentService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
    ComplianceAndEnforcementPropertyProfile,
    ComplianceAndEnforcementDocumentProfile,
  ],
  exports: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementPropertyService,
    ComplianceAndEnforcementDocumentService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
    ComplianceAndEnforcementPropertyProfile,
    ComplianceAndEnforcementDocumentProfile,
  ],
})
export class ComplianceAndEnforcementModule {}
