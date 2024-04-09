import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for possible NOI decision outcomes',
})
export class NoticeOfIntentDecisionOutcome extends BaseCodeEntity {}
