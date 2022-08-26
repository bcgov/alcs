import { AutoMap } from '@automapper/classes';
import { Column } from 'typeorm';
import { Base } from './base.entity';

export abstract class BaseCodeEntity extends Base {
  @AutoMap()
  @Column()
  label: string;

  @AutoMap()
  @Column({ type: 'text', width: 4, unique: true })
  code: string;

  @AutoMap()
  @Column({ type: 'text', unique: true })
  description: string;
}
