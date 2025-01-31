import { Base } from '../../../../common/entities/base.entity';
import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';
import { Card } from '../../../card/card.entity';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision.entity';

@Entity({ comment: 'Links notice of intent decision conditions with cards' })
export class NoticeOfIntentDecisionConditionCard extends Base {
  constructor(data?: Partial<NoticeOfIntentDecisionConditionCard>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @OneToMany(() => NoticeOfIntentDecisionCondition, (condition) => condition.conditionCard, {
    nullable: false,
    cascade: true,
  })
  conditions: NoticeOfIntentDecisionCondition[];

  @OneToOne(() => Card, { nullable: false })
  @JoinColumn()
  card: Card;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid: string;

  @AutoMap(() => NoticeOfIntentDecision)
  @ManyToOne(() => NoticeOfIntentDecision, (decision) => decision.uuid, {
    nullable: false,
  })
  decision: NoticeOfIntentDecision;
}
