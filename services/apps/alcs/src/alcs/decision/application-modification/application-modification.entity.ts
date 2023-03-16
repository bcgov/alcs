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
import { Application } from '../../application/application.entity';
import { Card } from '../../card/card.entity';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationDecision } from '../application-decision/application-decision.entity';
import { ApplicationModificationOutcomeType } from './modification-outcome-type/application-modification-outcome-type.entity';

@Entity()
export class ApplicationModification extends Base {
  constructor(data?: Partial<ApplicationModification>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  submittedDate: Date;

  @AutoMap()
  @Column({ type: 'text', default: 'PEN' })
  reviewOutcomeCode: string;

  @AutoMap()
  @ManyToOne(() => ApplicationModificationOutcomeType, {
    nullable: false,
  })
  reviewOutcome: ApplicationModificationOutcomeType;

  @AutoMap()
  @Column()
  isTimeExtension: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  reviewDate: Date | null;

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
  card: Card | null;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid: string;

  @ManyToMany(() => ApplicationDecision, (decision) => decision.modifiedBy)
  @JoinTable({
    name: 'modified_decisions',
  })
  modifiesDecisions: ApplicationDecision[];

  @OneToOne(() => ApplicationDecision, (dec) => dec.modifies)
  resultingDecision?: ApplicationDecision;
}
