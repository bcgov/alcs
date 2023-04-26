import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ModificationProfile } from '../../../common/automapper/modification.automapper.profile';
import { ReconsiderationProfile } from '../../../common/automapper/reconsideration.automapper.profile';
import { DocumentModule } from '../../../document/document.module';
import { ApplicationModule } from '../../application/application.module';
import { BoardModule } from '../../board/board.module';
import { CardModule } from '../../card/card.module';
import { DecisionOutcomeCode } from '../application-decision-outcome.entity';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationModificationOutcomeType } from '../application-modification/modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationOutcomeType } from '../application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from '../application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CeoCriterionCode } from '../ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from '../decision-document/decision-document.entity';
import { DecisionMakerCode } from '../decision-maker/decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionV2Controller } from './application-decision/application-decision-v2.controller';
import { ApplicationDecisionV2Service } from './application-decision/application-decision-v2.service';

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
      ApplicationDecisionChairReviewOutcomeType,
      ApplicationReconsiderationOutcomeType,
      ApplicationModificationOutcomeType,
    ]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    DocumentModule,
    DecisionV2Module,
  ],
  providers: [
    ModificationProfile,
    ApplicationDecisionV2Service,
    ApplicationDecisionProfile,
    ReconsiderationProfile,
  ],
  controllers: [ApplicationDecisionV2Controller],
  exports: [ApplicationDecisionV2Service],
})
export class DecisionV2Module {}
