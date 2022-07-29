import { AutoMap } from '@automapper/classes';
import { Column } from 'typeorm';
import { Base } from './base.entity';

// TODO: add seed migration
export abstract class BaseCodeEntity extends Base {
  @AutoMap()
  @Column({ type: 'text', width: 4, nullable: false, unique: true })
  code: string;

  @AutoMap()
  @Column({ type: 'text', nullable: false, unique: true })
  description;
}
