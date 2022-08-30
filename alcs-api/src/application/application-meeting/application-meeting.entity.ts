import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { ApplicationMeetingType } from '../application-code/application-meeting-type/application-meeting-type.entity';
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
  // TODO: delete startDate and endDate ALCS-96
  @AutoMap()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @AutoMap()
  @Column()
  description: string;

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

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationPausedUuid: string;

  @AutoMap()
  @OneToOne(() => ApplicationPaused, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @Type(() => ApplicationPaused)
  applicationPaused: ApplicationPaused;
}
