import { AutoMap } from 'automapper-classes';
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
import { User } from '../../user/user.entity';
import { NoticeOfIntentDecisionConditionCard } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.entity';

@Entity({
  comment: 'Decisions saved to NOIs, linked to the modification request',
})
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
    comment: 'Date that indicates when decision was created. It is not editable by user.',
  })
  createdAt: Date;

  @AutoMap(() => [NoticeOfIntentDecisionDocument])
  @OneToMany(() => NoticeOfIntentDecisionDocument, (document) => document.decision)
  documents: NoticeOfIntentDecisionDocument[];

  @AutoMap()
  @ManyToOne(() => NoticeOfIntent)
  noticeOfIntent: NoticeOfIntent;

  @AutoMap()
  @Column()
  @Index('IDX_noticeOfIntentUuid', {
    synchronize: false, //TypeORM does not support Hash Indexes
  })
  noticeOfIntentUuid: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'Used to track if/when the email was sent for this decision',
  })
  emailSent: Date | null;

  @Column({
    default: [],
    array: true,
    type: 'text',
    comment: 'Tracks extra emails to send the decision email to',
  })
  ccEmails: string[];

  @ManyToMany(() => NoticeOfIntentModification, (modification) => modification.modifiesDecisions)
  modifiedBy: NoticeOfIntentModification[];

  @AutoMap(() => NoticeOfIntentModification)
  @OneToOne(() => NoticeOfIntentModification, (modification) => modification.resultingDecision, { nullable: true })
  @JoinColumn()
  modifies?: NoticeOfIntentModification | null;

  @AutoMap(() => [NoticeOfIntentDecisionComponent])
  @OneToMany(() => NoticeOfIntentDecisionComponent, (component) => component.noticeOfIntentDecision, {
    cascade: ['insert', 'update'],
  })
  components: NoticeOfIntentDecisionComponent[];

  @AutoMap(() => [NoticeOfIntentDecisionCondition])
  @OneToMany(() => NoticeOfIntentDecisionCondition, (component) => component.decision, {
    cascade: ['insert', 'update'],
  })
  conditions: NoticeOfIntentDecisionCondition[];

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_decisions to alcs.notice_of_intent_decisions.',
  })
  oatsAlrApplDecisionId: number;

  @AutoMap()
  @Column({ default: false })
  isFlagged: boolean;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  reasonFlagged: string | null;

  @AutoMap(() => Date)
  @Column({ type: 'timestamptz', nullable: true })
  followUpAt: Date | null;

  @AutoMap(() => User)
  @ManyToOne(() => User, { nullable: true, eager: true })
  flaggedBy: User | null;

  @AutoMap(() => User)
  @ManyToOne(() => User, { nullable: true, eager: true })
  flagEditedBy: User | null;

  @AutoMap(() => Date)
  @Column({ type: 'timestamptz', nullable: true })
  flagEditedAt: Date | null;

  @AutoMap(() => [NoticeOfIntentDecisionConditionCard])
  @OneToMany(() => NoticeOfIntentDecisionConditionCard, (conditionCard) => conditionCard.decision, {
    cascade: ['insert', 'update'],
  })
  conditionCards: NoticeOfIntentDecisionConditionCard[];
}
