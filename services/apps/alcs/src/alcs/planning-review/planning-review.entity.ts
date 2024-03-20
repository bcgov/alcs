import { AutoMap } from 'automapper-classes';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReviewMeeting } from './planning-review-meeting/planning-review-meeting.entity';
import { PlanningReviewType } from './planning-review-type.entity';

@Entity({
  comment: 'A review of a local government or municipalities plan',
})
export class PlanningReview extends Base {
  constructor(data?: Partial<PlanningReview>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({ unique: true })
  fileNumber: string;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Application Id that is applicable only to paper version applications from 70s - 80s',
    nullable: true,
  })
  legacyId?: string | null;

  @Column({ nullable: false })
  documentName: string;

  @ManyToOne(() => LocalGovernment)
  localGovernment: LocalGovernment;

  @Index()
  @Column({
    type: 'uuid',
  })
  localGovernmentUuid: string;

  @ManyToOne(() => ApplicationRegion)
  region: ApplicationRegion;

  @Column()
  regionCode: string;

  @AutoMap(() => PlanningReviewType)
  @ManyToOne(() => PlanningReviewType, { nullable: false })
  type: PlanningReviewType;

  @AutoMap(() => [PlanningReferral])
  @OneToMany(() => PlanningReferral, (referral) => referral.planningReview)
  referrals: PlanningReferral[];

  @AutoMap(() => [PlanningReviewMeeting])
  @OneToMany(
    () => PlanningReviewMeeting,
    (reviewMeeting) => reviewMeeting.planningReview,
  )
  meetings: PlanningReviewMeeting[];

  @Column()
  typeCode: string;

  @Column({ default: true })
  open: boolean;

  @ManyToOne(() => User)
  closedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  closedDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  decisionDate: Date | null;
}
