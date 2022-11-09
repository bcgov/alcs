import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { AmendmentProfile } from '../common/automapper/amendment.automapper.profile';
import { ApplicationDecisionProfile } from '../common/automapper/application-decision.automapper.profile';
import { ReconsiderationProfile } from '../common/automapper/reconsideration.automapper.profile';
import { DocumentModule } from '../document/document.module';
import { ApplicationAmendmentController } from './application-amendment/application-amendment.controller';
import { ApplicationAmendment } from './application-amendment/application-amendment.entity';
import { ApplicationAmendmentService } from './application-amendment/application-amendment.service';
import { ApplicationDecisionMeetingController } from './application-decision-meeting/application-decision-meeting.controller';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting/application-decision-meeting.service';
import { DecisionOutcomeCode } from './application-decision/application-decision-outcome.entity';
import { ApplicationDecisionController } from './application-decision/application-decision.controller';
import { ApplicationDecision } from './application-decision/application-decision.entity';
import { ApplicationDecisionService } from './application-decision/application-decision.service';
import { CeoCriterionCode } from './application-decision/ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './application-decision/decision-document.entity';
import { DecisionMakerCode } from './application-decision/decision-maker/decision-maker.entity';
import { ApplicationReconsiderationController } from './application-reconsideration/application-reconsideration.controller';
import { ApplicationReconsideration } from './application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration/application-reconsideration.service';
import { ApplicationReconsiderationType } from './application-reconsideration/reconsideration-type/application-reconsideration-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DecisionOutcomeCode,
      DecisionMakerCode,
      CeoCriterionCode,
      ApplicationDecision,
      DecisionDocument,
      ApplicationAmendment,
      ApplicationReconsideration,
      ApplicationReconsiderationType,
      ApplicationDecisionMeeting,
    ]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    DocumentModule,
  ],
  providers: [
    ApplicationAmendmentService,
    AmendmentProfile,
    ApplicationDecisionService,
    ApplicationDecisionProfile,
    ApplicationReconsiderationService,
    ReconsiderationProfile,
    ApplicationDecisionMeetingService,
  ],
  controllers: [
    ApplicationAmendmentController,
    ApplicationDecisionController,
    ApplicationReconsiderationController,
    ApplicationDecisionMeetingController,
  ],
  exports: [
    ApplicationAmendmentService,
    ApplicationDecisionService,
    ApplicationReconsiderationService,
  ],
})
export class DecisionModule {}
