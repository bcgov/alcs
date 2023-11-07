import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { NoticeOfIntentDecisionComponent } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionConditionType } from './notice-of-intent-decision-condition-code.entity';

@Entity()
export class NoticeOfIntentDecisionCondition extends Base {
  constructor(data?: Partial<NoticeOfIntentDecisionCondition>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  approvalDependant: boolean | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  securityAmount: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  administrativeFee: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'timestamptz',
    comment: 'Condition Completion date',
    nullable: true,
  })
  completionDate?: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    comment: 'Condition Superseded date',
    nullable: true,
  })
  supersededDate?: Date | null;

  @ManyToOne(() => NoticeOfIntentDecisionConditionType)
  type: NoticeOfIntentDecisionConditionType;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  typeCode: string | null;

  @ManyToOne(() => NoticeOfIntentDecision, { nullable: false })
  decision: NoticeOfIntentDecision;

  @AutoMap(() => String)
  @Column()
  decisionUuid: string;

  @ManyToMany(
    () => NoticeOfIntentDecisionComponent,
    (component) => component.conditions,
    { nullable: true },
  )
  @JoinTable({
    name: 'notice_of_intent_decision_condition_component',
  })
  components: NoticeOfIntentDecisionComponent[] | null;
}
