import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

export enum CARD_STATUS {
  CANCELLED = 'CNCL',
  DECISION_RELEASED = 'RELE',
  READY_FOR_REVIEW = 'READ',
}

@Entity()
export class CardStatus extends BaseCodeEntity {}
