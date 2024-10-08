import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

export enum CARD_STATUS {
  CANCELLED = 'CNCL',
  DECISION_RELEASED = 'RELE',
  READY_FOR_REVIEW = 'READ',
  INCOMING = 'INCO',
  INCOMING_PRELIM_REVIEW = 'INPR',
  PRELIM_DONE = 'PREL',
}

@Entity({
  comment: 'Code table for possible kanban columns that cards can be in',
})
export class CardStatus extends BaseCodeEntity {}
