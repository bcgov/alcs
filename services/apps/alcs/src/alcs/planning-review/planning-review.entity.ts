import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
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

  @ManyToOne(() => PlanningReviewType, { nullable: false })
  type: PlanningReviewType;

  @Column()
  typeCode: string;

  @Column({ default: true })
  open: boolean;

  @ManyToOne(() => User)
  closedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  closedDate: Date | null;
}
