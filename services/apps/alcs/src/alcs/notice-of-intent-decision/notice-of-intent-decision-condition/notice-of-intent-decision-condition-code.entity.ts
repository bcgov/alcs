import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment: 'Decision Condition Types Code Table for Notice of Intents',
})
export class NoticeOfIntentDecisionConditionType extends BaseCodeEntity {}
