import { AutoMap } from '@automapper/classes';
import { Column } from 'typeorm';
import { Auditable } from './audit.entity';

export abstract class ObsoleteBaseCodeEntity extends Auditable {
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
