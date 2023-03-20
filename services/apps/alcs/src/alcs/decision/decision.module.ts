import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { ApplicationDecisionProfile } from '../../common/automapper/application-decision.automapper.profile';
import { ModificationProfile } from '../../common/automapper/modification.automapper.profile';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { DocumentModule } from '../../document/document.module';
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
import { ApplicationDecisionChairReviewOutcomeType } from './application-decision/decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationModificationController } from './application-modification/application-modification.controller';
import { ApplicationModification } from './application-modification/application-modification.entity';
import { ApplicationModificationService } from './application-modification/application-modification.service';
import { ApplicationModificationOutcomeType } from './application-modification/modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationReconsiderationController } from './application-reconsideration/application-reconsideration.controller';
import { ApplicationReconsideration } from './application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration/application-reconsideration.service';
import { ApplicationReconsiderationOutcomeType } from './application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from './application-reconsideration/reconsideration-type/application-reconsideration-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DecisionOutcomeCode,
      DecisionMakerCode,
      CeoCriterionCode,
      ApplicationDecision,
      DecisionDocument,
      ApplicationModification,
      ApplicationReconsideration,
      ApplicationReconsiderationType,
      ApplicationDecisionMeeting,
      ApplicationDecisionChairReviewOutcomeType,
      ApplicationReconsiderationOutcomeType,
      ApplicationModificationOutcomeType,
    ]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    DocumentModule,
  ],
  providers: [
    ApplicationModificationService,
    ModificationProfile,
    ApplicationDecisionService,
    ApplicationDecisionProfile,
    ApplicationReconsiderationService,
    ReconsiderationProfile,
    ApplicationDecisionMeetingService,
  ],
  controllers: [
    ApplicationModificationController,
    ApplicationDecisionController,
    ApplicationReconsiderationController,
    ApplicationDecisionMeetingController,
  ],
  exports: [
    ApplicationModificationService,
    ApplicationDecisionService,
    ApplicationReconsiderationService,
  ],
})
export class DecisionModule {}
