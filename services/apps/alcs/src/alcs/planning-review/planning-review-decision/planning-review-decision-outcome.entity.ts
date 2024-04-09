import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({ comment: 'Possible decision outcome types for Planning Review' })
export class PlanningReviewDecisionOutcomeCode extends BaseCodeEntity {}
