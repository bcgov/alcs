import { AutoMap } from 'automapper-classes';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { PlanningReview } from '../planning-review.entity';

export enum PR_VISIBILITY_FLAG {
  COMMISSIONER = 'C',
}

@Entity({
  comment: 'Stores planning review documents',
})
export class PlanningReviewDocument extends BaseEntity {
  constructor(data?: Partial<PlanningReviewDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => DocumentCode)
  type?: DocumentCode;

  @Column({ nullable: true })
  typeCode?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => PlanningReview, { nullable: false })
  planningReview: PlanningReview;

  @Column()
  @Index()
  planningReviewUuid: string;

  @Column({ nullable: true, type: 'uuid' })
  documentUuid?: string | null;

  @AutoMap(() => [String])
  @Column({ default: [], array: true, type: 'text' })
  visibilityFlags: PR_VISIBILITY_FLAG[];

  @Column({ nullable: true, type: 'int' })
  evidentiaryRecordSorting?: number | null;

  @Column({
    type: 'text',
    nullable: true,
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.planning_review to alcs.planning_review_document.',
  })
  oatsPlanningReviewId?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.planning_review_document.',
  })
  oatsDocumentId?: string | null;

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
