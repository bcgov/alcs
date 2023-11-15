import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting-type.entity';

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

  @Column({
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  startDate: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  endDate?: Date | null;

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
}
