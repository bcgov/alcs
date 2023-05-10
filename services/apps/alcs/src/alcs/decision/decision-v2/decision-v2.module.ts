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
import { ApplicationModificationService } from '../application-modification/application-modification.service';
import { ApplicationModificationOutcomeType } from '../application-modification/modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationReconsiderationOutcomeType } from '../application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from '../application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CeoCriterionCode } from '../ceo-criterion/ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../decision-condition/decision-condition-code.entity';
import { ApplicationDecisionCondition } from '../decision-condition/decision-condition.entity';
import { DecisionConditionService } from '../decision-condition/decision-condition.service';
import { DecisionDocument } from '../decision-document/decision-document.entity';
import { DecisionMakerCode } from '../decision-maker/decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionV1Service } from '../decision-v1/application-decision/application-decision-v1.service';
import { ApplicationDecisionV2Controller } from './application-decision/application-decision-v2.controller';
import { ApplicationDecisionV2Service } from './application-decision/application-decision-v2.service';
import { ApplicationDecisionComponentType } from './application-decision/component/application-decision-component-type.entity';
import { ApplicationDecisionComponent } from './application-decision/component/application-decision-component.entity';
import { ApplicationDecisionComponentService } from './application-decision/component/application-decision-component.service';

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
      ApplicationDecisionComponent,
      ApplicationDecisionComponentType,
      ApplicationDecisionCondition,
      ApplicationDecisionConditionType,
    ]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    DocumentModule,
    DecisionV2Module,
  ],
  providers: [
    ApplicationModificationService,
    ApplicationReconsiderationService,
    // This is required because it is referenced in ApplicationModificationService and ApplicationReconsiderationService.
    // However it must not be used anywhere in the reconsideration v2 controller directly.
    ApplicationDecisionV1Service,
    ModificationProfile,
    ReconsiderationProfile,
    ApplicationDecisionV2Service,
    ApplicationDecisionProfile,
    ApplicationDecisionComponentService,
    DecisionConditionService,
  ],
  controllers: [ApplicationDecisionV2Controller],
  exports: [ApplicationDecisionV2Service],
})
export class DecisionV2Module {}
