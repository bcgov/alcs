import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentDecisionComponent } from './notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionDocument } from './notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';
import { NoticeOfIntentModification } from './notice-of-intent-modification/notice-of-intent-modification.entity';

@Entity()
@Index(['resolutionNumber', 'resolutionYear'], {
  unique: true,
  where: '"audit_deleted_date_at" is null and "resolution_number" is not null',
})
export class NoticeOfIntentDecision extends Base {
  constructor(data?: Partial<NoticeOfIntentDecision>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  date: Date | null;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  auditDate: Date | null;

  @AutoMap(() => NoticeOfIntentDecisionOutcome)
  @ManyToOne(() => NoticeOfIntentDecisionOutcome, { nullable: false })
  outcome: NoticeOfIntentDecisionOutcome;

  @AutoMap(() => String)
  @Column()
  outcomeCode: string;

  @AutoMap(() => Number)
  @Column({ type: 'int4', nullable: true })
  resolutionNumber: number | null;

  @AutoMap()
  @Column({ type: 'smallint' })
  resolutionYear: number;

  @AutoMap(() => String)
  @Column({ type: 'varchar', nullable: true })
  decisionMaker?: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  decisionMakerName?: string | null;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  wasReleased: boolean;

  @AutoMap()
  @Column({
    comment: 'Indicates whether the decision is currently draft or not',
    default: false,
  })
  isDraft: boolean;

  @AutoMap(() => Boolean)
  @Column({
    comment: 'Indicates whether the decision is subject to conditions',
    type: 'boolean',
    nullable: true,
  })
  isSubjectToConditions?: boolean | null;

  @AutoMap(() => String)
  @Column({
    comment: 'Staff input field for a description of the decision',
    nullable: true,
    type: 'text',
  })
  decisionDescription?: string | null;

  @AutoMap(() => Boolean)
  @Column({
    comment: 'Indicates whether the stats are required for the decision',
    nullable: true,
    type: 'boolean',
  })
  isStatsRequired?: boolean | null;

  @AutoMap(() => Date)
  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'Date when decision was rescinded',
  })
  rescindedDate?: Date | null;

  @AutoMap(() => String)
  @Column({
    comment: 'Comment provided by the staff when the decision was rescinded',
    nullable: true,
    type: 'text',
  })
  rescindedComment?: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    update: false,
    comment:
      'Date that indicates when decision was created. It is not editable by user.',
  })
  createdAt: Date;

  @AutoMap(() => [NoticeOfIntentDecisionDocument])
  @OneToMany(
    () => NoticeOfIntentDecisionDocument,
    (document) => document.decision,
  )
  documents: NoticeOfIntentDecisionDocument[];

  @AutoMap()
  @ManyToOne(() => NoticeOfIntent)
  noticeOfIntent: NoticeOfIntent;

  @AutoMap()
  @Column()
  noticeOfIntentUuid: string;

  @ManyToMany(
    () => NoticeOfIntentModification,
    (modification) => modification.modifiesDecisions,
  )
  modifiedBy: NoticeOfIntentModification[];

  @AutoMap(() => NoticeOfIntentModification)
  @OneToOne(
    () => NoticeOfIntentModification,
    (modification) => modification.resultingDecision,
    { nullable: true },
  )
  @JoinColumn()
  modifies?: NoticeOfIntentModification | null;

  @AutoMap(() => [NoticeOfIntentDecisionComponent])
  @OneToMany(
    () => NoticeOfIntentDecisionComponent,
    (component) => component.noticeOfIntentDecision,
    { cascade: ['insert', 'update'] },
  )
  components: NoticeOfIntentDecisionComponent[];

  @AutoMap(() => [NoticeOfIntentDecisionCondition])
  @OneToMany(
    () => NoticeOfIntentDecisionCondition,
    (component) => component.decision,
    { cascade: ['insert', 'update'] },
  )
  conditions: NoticeOfIntentDecisionCondition[];
}
