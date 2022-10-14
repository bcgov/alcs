import { AutoMap } from '@automapper/classes';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObsoleteBaseCodeEntity } from '../../../common/entities/obsolete-base-code.entity';

@Entity()
export class ApplicationType extends ObsoleteBaseCodeEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column()
  shortLabel: string;

  @AutoMap()
  @Column()
  backgroundColor: string;

  @AutoMap()
  @Column()
  textColor: string;
}
