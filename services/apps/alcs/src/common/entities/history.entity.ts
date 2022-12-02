import { Column } from 'typeorm';
import { Base } from './base.entity';

export class EntityHistory extends Base {
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column()
  userId: string;
}
