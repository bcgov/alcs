import { Column } from 'typeorm';
import { Base, getTimestampColumnsOptions } from './base.entity';

export class EntityHistory extends Base {
  @Column({ ...getTimestampColumnsOptions() })
  startDate: number;

  @Column({
    ...getTimestampColumnsOptions(),
  })
  endDate: number;

  @Column()
  userId: string;
}
