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
import { Application } from '../application/application.entity';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import { ApplicationModification } from './application-modification/application-modification.entity';
import { ApplicationReconsideration } from './application-reconsideration/application-reconsideration.entity';
import { CeoCriterionCode } from './ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './decision-document/decision-document.entity';
import { DecisionMakerCode } from './decision-maker/decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from './decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionComponent } from './decision-v2/application-decision/component/decision-component.entity';

@Entity()
@Index(['resolutionNumber', 'resolutionYear'], {
  unique: true,
  where: '"audit_deleted_date_at" is null and "resolution_number" is not null',
})
export class ApplicationDecision extends Base {
  constructor(data?: Partial<ApplicationDecision>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  date: Date;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  auditDate: Date | null;

  @AutoMap()
  @Column({ type: 'boolean' })
  chairReviewRequired: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  chairReviewDate: Date | null;

  @ManyToOne(() => DecisionOutcomeCode, {
    nullable: false,
  })
  outcome: DecisionOutcomeCode;

  @AutoMap()
  @Column()
  outcomeCode: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;

  @AutoMap()
  @Column({ type: 'int4', nullable: true })
  resolutionNumber: number;

  @AutoMap()
  @Column({ type: 'smallint' })
  resolutionYear: number;

  @AutoMap()
  @ManyToOne(() => DecisionMakerCode, { nullable: true })
  decisionMaker?: DecisionMakerCode;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  decisionMakerCode: string | null;

  @AutoMap()
  @ManyToOne(() => CeoCriterionCode, { nullable: true })
  ceoCriterion?: CeoCriterionCode;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  ceoCriterionCode: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isTimeExtension: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isOther: boolean | null;

  @AutoMap()
  @Column({ nullable: true, type: 'text' })
  chairReviewOutcomeCode: string | null;

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

  @AutoMap(() => Number)
  @Column({
    comment:
      'Indicates how long the decision should stay hidden from public in days from decision date',
    nullable: true,
    type: 'integer',
  })
  daysHideFromPublic?: number | null;

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

  @AutoMap()
  @ManyToOne(() => ApplicationDecisionChairReviewOutcomeType, {
    nullable: true,
  })
  chairReviewOutcome: ApplicationDecisionChairReviewOutcomeType;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap()
  @OneToMany(() => DecisionDocument, (document) => document.decision)
  documents: DecisionDocument[];

  @ManyToMany(
    () => ApplicationReconsideration,
    (reconsideration) => reconsideration.reconsidersDecisions,
  )
  reconsideredBy: ApplicationReconsideration[];

  @ManyToMany(
    () => ApplicationModification,
    (modification) => modification.modifiesDecisions,
  )
  modifiedBy: ApplicationModification[];

  @AutoMap()
  @OneToOne(
    () => ApplicationModification,
    (modification) => modification.resultingDecision,
    { nullable: true },
  )
  @JoinColumn()
  modifies?: ApplicationModification | null;

  @AutoMap()
  @OneToOne(
    () => ApplicationReconsideration,
    (reconsideration) => reconsideration.resultingDecision,
    { nullable: true },
  )
  @JoinColumn()
  reconsiders?: ApplicationReconsideration | null;

  @AutoMap()
  @OneToMany(
    () => ApplicationDecisionComponent,
    (component) => component.applicationDecision,
    { cascade: ['insert'] },
  )
  components: ApplicationDecisionComponent[];
}
