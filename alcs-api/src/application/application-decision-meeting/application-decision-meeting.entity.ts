import { AutoMap } from '@automapper/classes';
import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../application.entity';

@Entity()
export class ApplicationDecisionMeeting extends Base {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  date: Date;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;
}
