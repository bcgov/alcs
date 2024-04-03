import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment:
    "Code table for the possible outcomes of the chair's application decision review",
})
export class ApplicationDecisionChairReviewOutcomeType extends BaseCodeEntity {}
