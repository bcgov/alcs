import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../application.entity';
import { ApplicationDecisionOutcomeType } from './application-decision-outcome.entity';
import { DecisionDocument } from './decision-document.entity';

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

  @ManyToOne(() => ApplicationDecisionOutcomeType, {
    nullable: false,
  })
  outcome: ApplicationDecisionOutcomeType;

  @AutoMap()
  @Column({ type: 'uuid' })
  outcomeUuid: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap()
  @OneToMany(() => DecisionDocument, (document) => document.decision)
  documents: DecisionDocument[];
}
