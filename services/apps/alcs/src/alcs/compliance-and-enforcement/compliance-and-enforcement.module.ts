import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceAndEnforcement } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from './compliance-and-enforcement.service';
import { ComplianceAndEnforcementController } from './compliance-and-enforcement.controller';
import { ComplianceAndEnforcementProfile } from './compliance-and-enforcement.automapper.profile';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceAndEnforcement])],
  controllers: [ComplianceAndEnforcementController],
  providers: [ComplianceAndEnforcementService, ComplianceAndEnforcementProfile],
  exports: [ComplianceAndEnforcementService, ComplianceAndEnforcementProfile],
})
export class ComplianceAndEnforcementModule {}
