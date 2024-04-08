import { AutoMap } from 'automapper-classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewDecisionDocument } from './planning-review-decision-document/planning-review-decision-document.entity';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';

@Entity({
  comment:
    "Links Planning Review decision document with the decision it's saved to",
})
@Index(['resolutionNumber', 'resolutionYear'], {
  unique: true,
  where: '"audit_deleted_date_at" is null and "resolution_number" is not null',
})
export class PlanningReviewDecision extends Base {
  constructor(data?: Partial<PlanningReviewDecision>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  date: Date | null;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  wasReleased: boolean;

  @AutoMap(() => PlanningReviewDecisionOutcomeCode)
  @ManyToOne(() => PlanningReviewDecisionOutcomeCode, {
    nullable: true,
  })
  outcome: PlanningReviewDecisionOutcomeCode | null;

  @AutoMap()
  @Column({ nullable: true })
  outcomeCode: string | null;

  @AutoMap()
  @Column({ type: 'int4', nullable: true })
  resolutionNumber: number;

  @AutoMap()
  @Column({ type: 'smallint' })
  resolutionYear: number;

  @AutoMap()
  @Column({
    comment: 'Indicates whether the decision is currently draft or not',
    default: false,
  })
  isDraft: boolean;

  @AutoMap(() => String)
  @Column({
    comment: 'Staff input field for a description of the decision',
    nullable: true,
    type: 'text',
  })
  decisionDescription?: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    update: false,
    comment:
      'Date that indicates when decision was created. It is not editable by user.',
  })
  createdAt: Date;

  @AutoMap()
  @ManyToOne(() => PlanningReview)
  planningReview: PlanningReview;

  @AutoMap()
  @Column({ type: 'uuid' })
  planningReviewUuid: string;

  @AutoMap(() => [PlanningReviewDecisionDocument])
  @OneToMany(
    () => PlanningReviewDecisionDocument,
    (document) => document.decision,
  )
  documents: PlanningReviewDecisionDocument[];
}
