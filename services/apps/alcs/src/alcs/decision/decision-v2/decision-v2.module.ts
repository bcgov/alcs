import { Module } from '@nestjs/common';
import { ApplicationDecisionController } from './application-decision/application-decision.controller';
import { ApplicationDecisionService } from './application-decision/application-decision.service';

@Module({
  providers: [ApplicationDecisionService],
  controllers: [ApplicationDecisionController],
})
export class DecisionV2Module {}
