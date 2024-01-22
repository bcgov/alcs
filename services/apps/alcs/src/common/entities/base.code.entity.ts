import { AutoMap } from 'automapper-classes';
import { Column, PrimaryColumn } from 'typeorm';
import { Auditable } from './audit.entity';

export abstract class BaseCodeEntity extends Auditable {
  @AutoMap()
  @Column()
  label: string;

  @AutoMap()
  @PrimaryColumn({ type: 'text', width: 4, unique: true })
  code: string;

  @AutoMap()
  @Column({ type: 'text', unique: true })
  description: string;
}
