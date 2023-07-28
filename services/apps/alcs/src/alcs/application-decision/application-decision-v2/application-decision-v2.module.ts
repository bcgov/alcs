import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSubmissionStatusModule } from '../../../application-submission-status/application-submission-status.module';
import { ApplicationSubmissionStatusType } from '../../../application-submission-status/submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../../../application-submission-status/submission-status.entity';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ModificationProfile } from '../../../common/automapper/modification.automapper.profile';
import { ReconsiderationProfile } from '../../../common/automapper/reconsideration.automapper.profile';
import { DocumentModule } from '../../../document/document.module';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { NaruSubtype } from '../../../portal/application-submission/naru-subtype/naru-subtype.entity';
import { ApplicationModule } from '../../application/application.module';
import { BoardModule } from '../../board/board.module';
import { CardModule } from '../../card/card.module';
import { ApplicationCeoCriterionCode } from '../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionComponentLot } from '../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionConditionToComponentLot } from '../application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionType } from '../application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionController } from '../application-decision-condition/application-decision-condition.controller';
import { ApplicationDecisionCondition } from '../application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionConditionService } from '../application-decision-condition/application-decision-condition.service';
import { ApplicationDecisionDocument } from '../application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from '../application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../application-decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionOutcomeCode } from '../application-decision-outcome.entity';
import { ApplicationDecisionV1Service } from '../application-decision-v1/application-decision/application-decision-v1.service';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationModificationOutcomeType } from '../application-modification/application-modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationModificationService } from '../application-modification/application-modification.service';
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
import { LinkedResolutionOutcomeType } from './application-decision/linked-resolution-outcome-type.entity';

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
      LinkedResolutionOutcomeType,
      NaruSubtype,
      ApplicationSubmissionToSubmissionStatus,
      ApplicationSubmission,
      ApplicationSubmissionStatusType,
      ApplicationDecisionComponentLot,
      ApplicationDecisionConditionToComponentLot,
    ]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    DocumentModule,
    ApplicationDecisionV2Module,
    ApplicationSubmissionStatusModule,
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
    ApplicationDecisionConditionService,
  ],
  controllers: [
    ApplicationDecisionV2Controller,
    ApplicationDecisionComponentController,
    ApplicationDecisionConditionController,
  ],
  exports: [ApplicationDecisionV2Service],
})
export class ApplicationDecisionV2Module {}
