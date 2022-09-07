import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { ApplicationMeetingType } from '../application-code/application-meeting-type/application-meeting-type.entity';
import { Application } from '../application.entity';

@Entity()
export class ApplicationMeeting extends Base {
  constructor(data?: Partial<ApplicationMeeting>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @AutoMap()
  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({
    type: 'uuid',
  })
  typeUuid: string;

  @ManyToOne(() => ApplicationMeetingType, {
    nullable: false,
  })
  type: ApplicationMeetingType;

  @AutoMap()
  @Column()
  applicationUuid: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;
}
