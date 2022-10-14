import { AutoMap } from '@automapper/classes';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObsoleteBaseCodeEntity } from '../../common/entities/obsolete-base-code.entity';

@Entity()
export class DecisionOutcomeCode extends ObsoleteBaseCodeEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;
}
