import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

export enum CARD_TYPE {
  APP = 'APP',
  RECON = 'RECON',
  PLAN = 'PLAN',
  APP_MODI = 'MODI',
  COV = 'COV',
  NOI = 'NOI',
  NOI_MODI = 'NOIM',
}

@Entity()
export class CardType extends BaseCodeEntity {
  constructor(data?: Partial<CardType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'text', default: '' })
  portalHtmlDescription: string;
}
