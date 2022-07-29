import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity()
export class ApplicationStatus extends BaseCodeEntity {
  @AutoMap()
  @Column()
  label: string;
}
