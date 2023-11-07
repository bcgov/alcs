import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationMeetingType } from '../../code/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationPaused } from '../application-paused.entity';
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
  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column()
  typeCode: string;

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

  @AutoMap()
  @Column({ type: 'uuid', nullable: true })
  meetingPauseUuid: string;

  @AutoMap()
  @OneToOne(() => ApplicationPaused, {
    cascade: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @Type(() => ApplicationPaused)
  meetingPause: ApplicationPaused | null;

  @AutoMap()
  @Column({ type: 'uuid', nullable: true })
  reportPauseUuid: string | null;

  @AutoMap()
  @OneToOne(() => ApplicationPaused, {
    cascade: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @Type(() => ApplicationPaused)
  reportPause?: ApplicationPaused | null;
}
