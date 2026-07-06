import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentModule } from '../../document/document.module';
import { ComplianceAndEnforcementChronologyProfile } from './chronology/chronology.automapper.profile';
import { ComplianceAndEnforcementChronologyController } from './chronology/chronology.controller';
import { ComplianceAndEnforcementChronologyEntry } from './chronology/chronology.entity';
import { ComplianceAndEnforcementChronologyService } from './chronology/chronology.service';
import { ComplianceAndEnforcementChronologyInspectionProfile } from './chronology/inspection/inspection.automapper.profile';
import { ComplianceAndEnforcementChronologyInspectionController } from './chronology/inspection/inspection.controller';
import { ComplianceAndEnforcementChronologyInspection } from './chronology/inspection/inspection.entity';
import { ComplianceAndEnforcementChronologyInspectionService } from './chronology/inspection/inspection.service';
import { ComplianceAndEnforcementNoticeDueDate } from './chronology/notice/due-date/due-date.entity';
import { ComplianceAndEnforcementNoticeProfile } from './chronology/notice/notice.automapper.profile';
import { ComplianceAndEnforcementNoticeController } from './chronology/notice/notice.controller';
import { ComplianceAndEnforcementNotice } from './chronology/notice/notice.entity';
import { ComplianceAndEnforcementNoticeService } from './chronology/notice/notice.service';
import { ComplianceAndEnforcementValidatorService } from './compliance-and-enforcement-validator.service';
import { ComplianceAndEnforcementProfile } from './compliance-and-enforcement.automapper.profile';
import { ComplianceAndEnforcementController } from './compliance-and-enforcement.controller';
import { ComplianceAndEnforcement } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from './compliance-and-enforcement.service';
import { ComplianceAndEnforcementDocumentProfile } from './document/document.automapper.profile';
import { ComplianceAndEnforcementDocumentController } from './document/document.controller';
import { ComplianceAndEnforcementDocument } from './document/document.entity';
import { ComplianceAndEnforcementDocumentService } from './document/document.service';
import { ComplianceAndEnforcementPropertyProfile } from './property/property.automapper.profile';
import { ComplianceAndEnforcementPropertyController } from './property/property.controller';
import { ComplianceAndEnforcementProperty } from './property/property.entity';
import { ComplianceAndEnforcementPropertyService } from './property/property.service';
import {
  ComplianceAndEnforcementResponsibleParty,
  ComplianceAndEnforcementResponsiblePartyDirector,
} from './responsible-parties/entities';
import { ComplianceAndEnforcementResponsiblePartyProfile } from './responsible-parties/responsible-parties.automapper.profile';
import { ComplianceAndEnforcementResponsiblePartyController } from './responsible-parties/responsible-parties.controller';
import { ComplianceAndEnforcementResponsiblePartyService } from './responsible-parties/responsible-parties.service';
import { ComplianceAndEnforcementSubmitterProfile } from './submitter/submitter.automapper.profile';
import { ComplianceAndEnforcementSubmitterController } from './submitter/submitter.controller';
import { ComplianceAndEnforcementSubmitter } from './submitter/submitter.entity';
import { ComplianceAndEnforcementSubmitterService } from './submitter/submitter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceAndEnforcement,
      ComplianceAndEnforcementSubmitter,
      ComplianceAndEnforcementProperty,
      ComplianceAndEnforcementDocument,
      ComplianceAndEnforcementResponsibleParty,
      ComplianceAndEnforcementResponsiblePartyDirector,
      ComplianceAndEnforcementChronologyEntry,
      ComplianceAndEnforcementChronologyInspection,
      ComplianceAndEnforcementNotice,
      ComplianceAndEnforcementNoticeDueDate,
      DocumentCode,
    ]),
    DocumentModule,
  ],
  controllers: [
    ComplianceAndEnforcementController,
    ComplianceAndEnforcementSubmitterController,
    ComplianceAndEnforcementPropertyController,
    ComplianceAndEnforcementDocumentController,
    ComplianceAndEnforcementResponsiblePartyController,
    ComplianceAndEnforcementChronologyController,
    ComplianceAndEnforcementChronologyInspectionController,
    ComplianceAndEnforcementNoticeController,
  ],
  providers: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementPropertyService,
    ComplianceAndEnforcementDocumentService,
    ComplianceAndEnforcementResponsiblePartyService,
    ComplianceAndEnforcementChronologyService,
    ComplianceAndEnforcementChronologyInspectionService,
    ComplianceAndEnforcementNoticeService,
    ComplianceAndEnforcementValidatorService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
    ComplianceAndEnforcementPropertyProfile,
    ComplianceAndEnforcementDocumentProfile,
    ComplianceAndEnforcementResponsiblePartyProfile,
    ComplianceAndEnforcementChronologyProfile,
    ComplianceAndEnforcementChronologyInspectionProfile,
    ComplianceAndEnforcementNoticeProfile,
  ],
  exports: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementPropertyService,
    ComplianceAndEnforcementDocumentService,
    ComplianceAndEnforcementResponsiblePartyService,
    ComplianceAndEnforcementChronologyService,
    ComplianceAndEnforcementValidatorService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
    ComplianceAndEnforcementPropertyProfile,
    ComplianceAndEnforcementDocumentProfile,
    ComplianceAndEnforcementResponsiblePartyProfile,
    ComplianceAndEnforcementChronologyProfile,
    ComplianceAndEnforcementChronologyInspectionProfile,
    ComplianceAndEnforcementNoticeProfile,
  ],
})
export class ComplianceAndEnforcementModule {}
