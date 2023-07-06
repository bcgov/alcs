import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationDecisionConditionType } from './application-decision-condition-code.entity';

@Entity()
export class ApplicationDecisionCondition extends Base {
  constructor(data?: Partial<ApplicationDecisionCondition>) {
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

  @ManyToOne(() => ApplicationDecisionConditionType)
  type: ApplicationDecisionConditionType;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  typeCode: string | null;

  @ManyToOne(() => ApplicationDecision, { nullable: false })
  decision: ApplicationDecision;

  @AutoMap(() => String)
  @Column()
  decisionUuid: string;

  @ManyToMany(
    () => ApplicationDecisionComponent,
    (component) => component.conditions,
    { nullable: true },
  )
  @JoinTable({
    name: 'application_decision_condition_component',
  })
  components: ApplicationDecisionComponent[] | null;
}
