import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewMeetingType } from './planning-review-meeting-type.entity';

@Entity({
  comment: 'Meeting schedule for Planning Reviews',
})
export class PlanningReviewMeeting extends Base {
  constructor(data?: Partial<PlanningReviewMeeting>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => PlanningReviewMeetingType)
  @ManyToOne(() => PlanningReviewMeetingType, { nullable: false })
  type: PlanningReviewMeetingType;

  @Column()
  typeCode: string;

  @Column({
    type: 'timestamptz',
    comment: 'Date of the meeting',
  })
  date: Date;

  @ManyToOne(() => PlanningReview)
  planningReview: PlanningReview;

  @Column({ type: 'uuid' })
  planningReviewUuid: string;
}
