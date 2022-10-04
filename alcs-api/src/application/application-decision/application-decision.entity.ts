import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../application.entity';

@Entity()
export class ApplicationDecision extends Base {
  constructor(data?: Partial<ApplicationDecision>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  date: Date;

  @AutoMap()
  @Column()
  outcome: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;

  @AutoMap()
  @Column()
  applicationUuid: string;
}
