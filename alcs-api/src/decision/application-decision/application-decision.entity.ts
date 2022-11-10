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
import { ApplicationAmendment } from '../application-amendment/application-amendment.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../../application/application.entity';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import { CeoCriterionCode } from './ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './decision-document.entity';
import { DecisionMakerCode } from './decision-maker/decision-maker.entity';

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
  auditDate: Date;

  @AutoMap()
  @Column({ type: 'boolean' })
  chairReviewRequired: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  chairReviewDate: Date;

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
  @Column({ type: 'smallint' })
  resolutionNumber: number;

  @AutoMap()
  @Column({ type: 'smallint' })
  resolutionYear: number;

  @AutoMap()
  @ManyToOne(() => DecisionMakerCode, { nullable: true })
  decisionMaker?: DecisionMakerCode;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  decisionMakerCode?: string;

  @AutoMap()
  @ManyToOne(() => CeoCriterionCode, { nullable: true })
  ceoCriterion?: CeoCriterionCode;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  ceoCriterionCode?: string;

  @AutoMap()
  @Column({ nullable: true })
  isTimeExtension?: boolean;

  @AutoMap()
  @Column({ nullable: true })
  chairReviewOutcome?: boolean;

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
    () => ApplicationAmendment,
    (amendment) => amendment.amendsDecisions,
  )
  amendedBy: ApplicationAmendment[];

  @AutoMap()
  @OneToOne(() => ApplicationAmendment, (amend) => amend.resultingDecision, {
    nullable: true,
  })
  @JoinColumn()
  amends?: ApplicationAmendment;

  @AutoMap()
  @OneToOne(
    () => ApplicationReconsideration,
    (amend) => amend.resultingDecision,
    { nullable: true },
  )
  @JoinColumn()
  reconsiders?: ApplicationReconsideration;
}
