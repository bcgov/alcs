import { AutoMap } from '@automapper/classes';
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
import { ApplicationDecision } from '../application-decision/application-decision.entity';
import { Application } from '../../application/application.entity';
import { Card } from '../../card/card.entity';
import { Base } from '../../common/entities/base.entity';
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
  @ManyToOne(() => ApplicationReconsiderationType, {
    nullable: false,
  })
  type: ApplicationReconsiderationType;

  @AutoMap()
  @Column({ nullable: true })
  isReviewApproved: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  reviewDate: Date;

  @AutoMap()
  @ManyToOne(() => Application, { cascade: ['insert'] })
  application: Application;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap()
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid: string;

  @ManyToMany(() => ApplicationDecision, (decision) => decision.reconsideredBy)
  @JoinTable({
    name: 'reconsidered_decisions',
  })
  reconsidersDecisions: ApplicationDecision[];

  @OneToOne(() => ApplicationDecision, (dec) => dec.reconsiders)
  resultingDecision?: ApplicationDecision;
}
