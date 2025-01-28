import { Base } from '../../../../common/entities/base.entity';
import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import { Card } from '../../../card/card.entity';
import { ApplicationDecision } from '../../application-decision.entity';

@Entity({ comment: 'Links application decision conditions with cards' })
export class ApplicationDecisionConditionCard extends Base {
  constructor(data?: Partial<ApplicationDecisionConditionCard>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @OneToMany(() => ApplicationDecisionCondition, (condition) => condition.conditionCard, {
    nullable: false,
    cascade: true,
  })
  conditions: ApplicationDecisionCondition[];

  @OneToOne(() => Card, { nullable: false })
  @JoinColumn()
  card: Card;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid: string;

  @AutoMap(() => ApplicationDecision)
  @ManyToOne(() => ApplicationDecision, (decision) => decision.uuid, {
    nullable: false,
  })
  decision: ApplicationDecision;
}
