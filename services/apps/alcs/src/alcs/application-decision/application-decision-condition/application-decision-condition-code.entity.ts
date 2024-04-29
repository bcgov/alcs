import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for the possible application decision condition types',
})
export class ApplicationDecisionConditionType extends BaseCodeEntity {}
