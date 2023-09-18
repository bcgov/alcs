import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecision } from '../../application-decision/application-decision.entity';
import { ApplicationDecisionModule } from '../../application-decision/application-decision.module';
import { ApplicationModification } from '../../application-decision/application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../../application-decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationSubmissionStatusModule } from '../application-submission-status/application-submission-status.module';
import { Application } from '../application.entity';
import { ApplicationModule } from '../application.module';
import { ApplicationTimelineController } from './application-timeline.controller';
import { ApplicationTimelineService } from './application-timeline.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationModification,
      ApplicationReconsideration,
      ApplicationDecision,
    ]),
    ApplicationModule,
    ApplicationSubmissionStatusModule,
    ApplicationDecisionModule,
  ],
  providers: [ApplicationTimelineService],
  controllers: [ApplicationTimelineController],
})
export class ApplicationTimelineModule {}
