import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

export enum CARD_STATUS {
  CANCELLED = 'CNCL',
  DECISION_RELEASED = 'RELE',
}

@Entity()
export class CardStatus extends BaseCodeEntity {}
