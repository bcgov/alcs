import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSubmissionStatusModule } from '../../../application-submission-status/application-submission-status.module';
import { ApplicationSubmissionStatusType } from '../../../application-submission-status/submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../../../application-submission-status/submission-status.entity';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v1.automapper.profile';
import { ModificationProfile } from '../../../common/automapper/modification.automapper.profile';
import { ReconsiderationProfile } from '../../../common/automapper/reconsideration.automapper.profile';
import { DocumentModule } from '../../../document/document.module';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionModule } from '../../../portal/application-submission/application-submission.module';
import { ApplicationModule } from '../../application/application.module';
import { BoardModule } from '../../board/board.module';
import { CardModule } from '../../card/card.module';
import { ApplicationCeoCriterionCode } from '../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionDocument } from '../application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from '../application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../application-decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionOutcomeCode } from '../application-decision-outcome.entity';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationModificationOutcomeType } from '../application-modification/application-modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationModificationController } from '../application-modification/application-modification.controller';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationModificationService } from '../application-modification/application-modification.service';
import { ApplicationReconsiderationController } from '../application-reconsideration/application-reconsideration.controller';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationReconsiderationOutcomeType } from '../application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from '../application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { ApplicationDecisionMeetingController } from './application-decision-meeting/application-decision-meeting.controller';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting/application-decision-meeting.service';
import { ApplicationDecisionV1Controller } from './application-decision/application-decision-v1.controller';
import { ApplicationDecisionV1Service } from './application-decision/application-decision-v1.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationDecisionOutcomeCode,
      ApplicationDecisionMakerCode,
      ApplicationCeoCriterionCode,
      ApplicationDecision,
      ApplicationDecisionDocument,
      ApplicationModification,
      ApplicationReconsideration,
      ApplicationReconsiderationType,
      ApplicationDecisionMeeting,
      ApplicationDecisionChairReviewOutcomeType,
      ApplicationReconsiderationOutcomeType,
      ApplicationModificationOutcomeType,
      ApplicationSubmissionToSubmissionStatus,
      ApplicationSubmission,
      ApplicationSubmissionStatusType,
    ]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    DocumentModule,
    ApplicationSubmissionStatusModule,
    ApplicationSubmissionModule,
  ],
  providers: [
    ApplicationModificationService,
    ModificationProfile,
    ApplicationDecisionV1Service,
    ApplicationDecisionProfile,
    ApplicationReconsiderationService,
    ReconsiderationProfile,
    ApplicationDecisionMeetingService,
  ],
  controllers: [
    ApplicationModificationController,
    ApplicationDecisionV1Controller,
    ApplicationReconsiderationController,
    ApplicationDecisionMeetingController,
  ],
  exports: [
    ApplicationModificationService,
    ApplicationDecisionV1Service,
    ApplicationReconsiderationService,
  ],
})
export class ApplicationDecisionV1Module {}
