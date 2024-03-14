import { AutoMap } from 'automapper-classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auditable } from '../../../../common/entities/audit.entity';
import { Document } from '../../../../document/document.entity';
import { PlanningReviewDecision } from '../planning-review-decision.entity';

@Entity()
export class PlanningReviewDecisionDocument extends Auditable {
  constructor(data?: Partial<PlanningReviewDecisionDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => PlanningReviewDecision, { nullable: false })
  decision: PlanningReviewDecision;

  @Column()
  decisionUuid: string;

  @OneToOne(() => Document, {
    cascade: true,
  })
  @JoinColumn()
  document: Document;
}
