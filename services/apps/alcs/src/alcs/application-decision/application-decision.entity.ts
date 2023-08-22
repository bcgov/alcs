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
import { ApplicationDecisionOutcomeCode } from './application-decision-outcome.entity';
import { ApplicationModification } from './application-modification/application-modification.entity';
import { ApplicationReconsideration } from './application-reconsideration/application-reconsideration.entity';
import { ApplicationCeoCriterionCode } from './application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionCondition } from './application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionDocument } from './application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from './application-decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionComponent } from './application-decision-v2/application-decision/component/application-decision-component.entity';
import { LinkedResolutionOutcomeType } from './application-decision-v2/application-decision/linked-resolution-outcome-type.entity';

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
  @Column({ type: 'timestamptz', nullable: true })
  date: Date | null;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  auditDate: Date | null;

  @AutoMap()
  @Column({ type: 'boolean' })
  chairReviewRequired: boolean;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  wasReleased: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  chairReviewDate: Date | null;

  @AutoMap(() => ApplicationDecisionOutcomeCode)
  @ManyToOne(() => ApplicationDecisionOutcomeCode, {
    nullable: false,
  })
  outcome: ApplicationDecisionOutcomeCode;

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

  @AutoMap(() => ApplicationDecisionMakerCode)
  @ManyToOne(() => ApplicationDecisionMakerCode, { nullable: true })
  decisionMaker?: ApplicationDecisionMakerCode;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  decisionMakerCode: string | null;

  @AutoMap(() => ApplicationCeoCriterionCode)
  @ManyToOne(() => ApplicationCeoCriterionCode, { nullable: true })
  ceoCriterion?: ApplicationCeoCriterionCode;

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

  @AutoMap(() => ApplicationDecisionChairReviewOutcomeType)
  @ManyToOne(() => ApplicationDecisionChairReviewOutcomeType, {
    nullable: true,
  })
  chairReviewOutcome: ApplicationDecisionChairReviewOutcomeType;

  @AutoMap()
  @Column({ nullable: true, type: 'text' })
  chairReviewOutcomeCode: string | null;

  @AutoMap(() => LinkedResolutionOutcomeType)
  @ManyToOne(() => LinkedResolutionOutcomeType, {
    nullable: true,
  })
  linkedResolutionOutcome: LinkedResolutionOutcomeType | null;

  @AutoMap()
  @Column({ nullable: true, type: 'text' })
  linkedResolutionOutcomeCode: string | null;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap(() => [ApplicationDecisionDocument])
  @OneToMany(() => ApplicationDecisionDocument, (document) => document.decision)
  documents: ApplicationDecisionDocument[];

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

  @AutoMap(() => ApplicationModification)
  @OneToOne(
    () => ApplicationModification,
    (modification) => modification.resultingDecision,
    { nullable: true },
  )
  @JoinColumn()
  modifies?: ApplicationModification | null;

  @AutoMap(() => ApplicationReconsideration)
  @OneToOne(
    () => ApplicationReconsideration,
    (reconsideration) => reconsideration.resultingDecision,
    { nullable: true },
  )
  @JoinColumn()
  reconsiders?: ApplicationReconsideration | null;

  @AutoMap(() => [ApplicationDecisionComponent])
  @OneToMany(
    () => ApplicationDecisionComponent,
    (component) => component.applicationDecision,
    { cascade: ['insert', 'update'] },
  )
  components: ApplicationDecisionComponent[];

  @AutoMap(() => [ApplicationDecisionCondition])
  @OneToMany(
    () => ApplicationDecisionCondition,
    (component) => component.decision,
    { cascade: ['insert', 'update'] },
  )
  conditions: ApplicationDecisionCondition[];
}
