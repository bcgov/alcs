import { Module } from '@nestjs/common';
import { ApplicationDecisionV2Module } from '../../alcs/application-decision/application-decision-v2/application-decision-v2.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationDecisionController } from './application-decision.controller';

@Module({
  imports: [ApplicationDecisionV2Module, ApplicationSubmissionModule],
  controllers: [ApplicationDecisionController],
  providers: [],
  exports: [],
})
export class PortalApplicationDecisionModule {}
