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

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceAndEnforcement, ComplianceAndEnforcementSubmitter])],
  controllers: [ComplianceAndEnforcementController, ComplianceAndEnforcementSubmitterController],
  providers: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
  ],
  exports: [
    ComplianceAndEnforcementService,
    ComplianceAndEnforcementSubmitterService,
    ComplianceAndEnforcementProfile,
    ComplianceAndEnforcementSubmitterProfile,
  ],
})
export class ComplianceAndEnforcementModule {}
