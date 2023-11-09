import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { Application } from '../../application/application.entity';
import { Card } from '../../card/card.entity';
import { ApplicationDecision } from '../application-decision.entity';

import { ApplicationReconsiderationOutcomeType } from './reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

@Entity()
export class ApplicationReconsideration extends Base {
  constructor(data?: Partial<ApplicationReconsideration>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  submittedDate: Date;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  reviewDate: Date | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Reconsideration description provided by ALCS staff',
  })
  description?: string;

  @AutoMap(() => Boolean)
  @Column({
    type: 'boolean',
    nullable: true,
  })
  isNewProposal?: boolean;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isIncorrectFalseInfo?: boolean;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isNewEvidence?: boolean;

  @AutoMap(() => ApplicationReconsiderationType)
  @ManyToOne(() => ApplicationReconsiderationType, {
    nullable: false,
  })
  type: ApplicationReconsiderationType;

  @AutoMap()
  @Column({ nullable: true, type: 'text' })
  reviewOutcomeCode?: string | null;

  @AutoMap(() => ApplicationReconsiderationOutcomeType)
  @ManyToOne(() => ApplicationReconsiderationOutcomeType, {
    nullable: true,
  })
  reviewOutcome: ApplicationReconsiderationOutcomeType | null;

  @AutoMap()
  @Column({ nullable: true, type: 'text' })
  decisionOutcomeCode?: string | null;

  @AutoMap(() => ApplicationReconsiderationOutcomeType)
  @ManyToOne(() => ApplicationReconsiderationOutcomeType, {
    nullable: true,
  })
  decisionOutcome: ApplicationReconsiderationOutcomeType | null;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap(() => Application)
  @ManyToOne(() => Application, { cascade: ['insert'] })
  application: Application;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid: string;

  @AutoMap(() => Card)
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card | null;

  @AutoMap(() => [ApplicationDecision])
  @ManyToMany(() => ApplicationDecision, (decision) => decision.reconsideredBy)
  @JoinTable({
    name: 'application_reconsidered_decisions',
  })
  reconsidersDecisions: ApplicationDecision[];

  @AutoMap(() => ApplicationDecision)
  @OneToOne(() => ApplicationDecision, (dec) => dec.reconsiders)
  resultingDecision?: ApplicationDecision;
}
