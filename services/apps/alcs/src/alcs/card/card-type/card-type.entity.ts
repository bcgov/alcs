import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class CardType extends BaseCodeEntity {
  @AutoMap()
  @Column({ type: 'text', default: '' })
  portalHtmlDescription: string;
}
