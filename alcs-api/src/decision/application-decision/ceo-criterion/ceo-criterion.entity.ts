import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class CeoCriterionCode extends BaseCodeEntity {
  @AutoMap()
  @Column({ unique: true })
  number: number;
}
