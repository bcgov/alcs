import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { Application } from '../../application/application.entity';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import { CeoCriterionCode } from './ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './decision-document.entity';
import { DecisionMakerCode } from './decision-maker/decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from './decision-outcome-type/application-decision-outcome-type.entity';

@Entity()
@Unique('resolution', ['resolutionNumber', 'resolutionYear'])
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
  @Column({ type: 'int4' })
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
}
