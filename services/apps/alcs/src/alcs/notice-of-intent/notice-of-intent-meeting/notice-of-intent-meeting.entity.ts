import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting-type.entity';
// import { ApplicationPaused } from '../application-paused.entity';

@Entity()
export class NoticeOfIntentMeeting extends Base {
  constructor(data?: Partial<NoticeOfIntentMeeting>) {
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

  @ManyToOne(() => NoticeOfIntentMeetingType, {
    nullable: false,
  })
  type: NoticeOfIntentMeetingType;

  @AutoMap()
  @Column()
  noticeOfIntentUuid: string;

  @AutoMap()
  @ManyToOne(() => NoticeOfIntent)
  noticeOfIntent: NoticeOfIntent;

  @AutoMap()
  @Column({ type: 'uuid', nullable: true })
  meetingPauseUuid: string;

  // @AutoMap()
  // @OneToOne(() => ApplicationPaused, {
  //   cascade: true,
  //   onDelete: 'SET NULL',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn()
  // @Type(() => ApplicationPaused)
  // meetingPause: ApplicationPaused | null;

  // @AutoMap()
  // @Column({ type: 'uuid', nullable: true })
  // reportPauseUuid: string;

  // @AutoMap()
  // @OneToOne(() => ApplicationPaused, {
  //   cascade: true,
  //   onDelete: 'SET NULL',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn()
  // @Type(() => ApplicationPaused)
  // reportPause?: ApplicationPaused | null;
}
