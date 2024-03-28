import { AutoMap } from 'automapper-classes';
import { Column, CreateDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { Application } from '../application/application.entity';
import { Inquiry } from '../inquiry/inquiry.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';

@Entity()
export class StaffJournal extends Base {
  constructor(data?: Partial<StaffJournal>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column()
  body: string;

  @Column({ default: false })
  edited: boolean;

  @AutoMap()
  @ManyToOne(() => User)
  author: User;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Application)
  application: Application | null;
  @Column({ nullable: true })
  @Index()
  applicationUuid: string;

  @ManyToOne(() => NoticeOfIntent)
  noticeOfIntent: NoticeOfIntent | null;

  @Column({ nullable: true })
  @Index()
  noticeOfIntentUuid: string;

  @ManyToOne(() => Notification)
  notification: Notification | null;

  @Column({ nullable: true })
  @Index()
  notificationUuid: string;

  @ManyToOne(() => PlanningReview)
  planningReview: PlanningReview | null;

  @Column({ nullable: true })
  @Index()
  planningReviewUuid: string;

  @ManyToOne(() => Inquiry)
  inquiry: Inquiry | null;

  @Column({ nullable: true })
  @Index()
  inquiryUuid: string;
}
