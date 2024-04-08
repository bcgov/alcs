import { AutoMap } from 'automapper-classes';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { Application } from '../application.entity';

@Entity({ comment: 'Dates for application review discussions' })
export class ApplicationDecisionMeeting extends Base {
  constructor(data?: Partial<ApplicationDecisionMeeting>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  date: Date;

  @AutoMap()
  @Index()
  @Column()
  applicationUuid: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;
}
