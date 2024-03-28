import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ModificationProfile } from '../../../common/automapper/modification.automapper.profile';
import { ReconsiderationProfile } from '../../../common/automapper/reconsideration.automapper.profile';
import { DocumentModule } from '../../../document/document.module';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { NaruSubtype } from '../../../portal/application-submission/naru-subtype/naru-subtype.entity';
import { ApplicationSubmissionStatusModule } from '../../application/application-submission-status/application-submission-status.module';
import { ApplicationSubmissionStatusType } from '../../application/application-submission-status/submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../../application/application-submission-status/submission-status.entity';
import { ApplicationModule } from '../../application/application.module';
import { BoardModule } from '../../board/board.module';
import { CardModule } from '../../card/card.module';
import { ApplicationBoundaryAmendmentController } from '../application-boundary-amendment/application-boundary-amendment.controller';
import { ApplicationBoundaryAmendment } from '../application-boundary-amendment/application-boundary-amendment.entity';
import { ApplicationBoundaryAmendmentService } from '../application-boundary-amendment/application-boundary-amendment.service';
import { ApplicationCeoCriterionCode } from '../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionComponentLotController } from '../application-component-lot/application-decision-component-lot.controller';
import { ApplicationDecisionComponentLot } from '../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionComponentLotService } from '../application-component-lot/application-decision-component-lot.service';
import { ApplicationConditionToComponentLotController } from '../application-condition-to-component-lot/application-condition-to-component-lot.controller';
import { ApplicationConditionToComponentLotService } from '../application-condition-to-component-lot/application-condition-to-component-lot.service';
import { ApplicationDecisionConditionToComponentLot } from '../application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionConditionType } from '../application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionController } from '../application-decision-condition/application-decision-condition.controller';
import { ApplicationDecisionCondition } from '../application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionConditionService } from '../application-decision-condition/application-decision-condition.service';
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
import { ApplicationDecisionV2Controller } from './application-decision/application-decision-v2.controller';
import { ApplicationDecisionV2Service } from './application-decision/application-decision-v2.service';
import { ApplicationDecisionComponentType } from './application-decision/component/application-decision-component-type.entity';
import { ApplicationDecisionComponentController } from './application-decision/component/application-decision-component.controller';
import { ApplicationDecisionComponent } from './application-decision/component/application-decision-component.entity';
import { ApplicationDecisionComponentService } from './application-decision/component/application-decision-component.service';

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
      ApplicationDecisionChairReviewOutcomeType,
      ApplicationReconsiderationOutcomeType,
      ApplicationModificationOutcomeType,
      ApplicationDecisionComponent,
      ApplicationDecisionComponentType,
      ApplicationDecisionCondition,
      ApplicationDecisionConditionType,
      NaruSubtype,
      ApplicationSubmissionToSubmissionStatus,
      ApplicationSubmission,
      ApplicationSubmissionStatusType,
      ApplicationDecisionComponentLot,
      ApplicationDecisionConditionToComponentLot,
      ApplicationDecisionConditionComponentPlanNumber,
      ApplicationBoundaryAmendment,
    ]),
    forwardRef(() => BoardModule),
    forwardRef(() => ApplicationModule),
    CardModule,
    DocumentModule,
    ApplicationSubmissionStatusModule,
  ],
  providers: [
    ApplicationModificationService,
    ApplicationReconsiderationService,
    ModificationProfile,
    ReconsiderationProfile,
    ApplicationDecisionV2Service,
    ApplicationDecisionProfile,
    ApplicationDecisionComponentService,
    ApplicationDecisionConditionService,
    ApplicationDecisionComponentLotService,
    ApplicationConditionToComponentLotService,
    ApplicationBoundaryAmendmentService,
  ],
  controllers: [
    ApplicationDecisionV2Controller,
    ApplicationDecisionComponentController,
    ApplicationDecisionConditionController,
    ApplicationDecisionComponentLotController,
    ApplicationConditionToComponentLotController,
    ApplicationBoundaryAmendmentController,
    ApplicationReconsiderationController,
    ApplicationModificationController,
  ],
  exports: [
    ApplicationDecisionV2Service,
    ApplicationModificationService,
    ApplicationReconsiderationService,
  ],
})
export class ApplicationDecisionV2Module {}
