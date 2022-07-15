import { Column } from 'typeorm';
import { Base } from './base.entity';

// TODO add seed migration
export abstract class BaseCodeEntity extends Base {
  @Column({ type: 'text', width: 4, nullable: false, unique: true })
  code: string;

  @Column({ type: 'text', nullable: false, unique: true })
  description;
}
