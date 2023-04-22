import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationDecisionController } from './application-decision/application-decision.controller';
import { ApplicationDecisionService } from './application-decision/application-decision.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationDecision])],
  providers: [ApplicationDecisionService],
  controllers: [ApplicationDecisionController],
})
export class DecisionV2Module {}
