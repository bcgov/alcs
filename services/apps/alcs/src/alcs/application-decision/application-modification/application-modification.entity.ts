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
import { ApplicationModificationOutcomeType } from './application-modification-outcome-type/application-modification-outcome-type.entity';

@Entity({
  comment: 'Application modification requests linked to card and application',
})
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

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Modification description provided by ALCS staff',
  })
  description?: string;

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
  @Column({ type: 'uuid', nullable: true })
  cardUuid: string | null;

  @ManyToMany(() => ApplicationDecision, (decision) => decision.modifiedBy)
  @JoinTable({
    name: 'application_modified_decisions',
  })
  modifiesDecisions: ApplicationDecision[];

  @OneToOne(() => ApplicationDecision, (dec) => dec.modifies)
  resultingDecision?: ApplicationDecision;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.application_modification.',
  })
  oatsReconsiderationRequestId: number;
}
