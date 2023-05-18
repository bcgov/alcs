import { Module } from '@nestjs/common';
import { DecisionV2Module } from '../../alcs/decision/decision-v2/decision-v2.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationDecisionController } from './application-decision.controller';

@Module({
  imports: [DecisionV2Module, ApplicationSubmissionModule],
  controllers: [ApplicationDecisionController],
  providers: [],
  exports: [],
})
export class PortalApplicationDecisionModule {}
