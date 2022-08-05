import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class ApplicationDecisionMaker extends BaseCodeEntity {
  @AutoMap()
  @Column()
  label: string;

  //TODO: Why is this not getting mapped from the inherited class?
  @AutoMap()
  description: string;
}
