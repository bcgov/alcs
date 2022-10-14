import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../application.entity';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import { CeoCriterionCode } from './ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './decision-document.entity';
import { DecisionMakerCode } from './decision-maker/decision-maker.entity';

@Entity()
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
  @Column({ type: 'uuid' })
  outcomeUuid: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;

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
}
