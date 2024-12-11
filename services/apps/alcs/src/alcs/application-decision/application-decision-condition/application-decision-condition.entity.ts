import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationDecisionConditionType } from './application-decision-condition-code.entity';
import { ApplicationDecisionConditionDate } from './application-decision-condition-date/application-decision-condition-date.entity';

@Entity({ comment: 'Fields present on the application decision conditions' })
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

  @ManyToMany(() => ApplicationDecisionComponent, (component) => component.conditions, { nullable: true })
  @JoinTable({
    name: 'application_decision_condition_component',
  })
  components: ApplicationDecisionComponent[] | null;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_conditions to alcs.application_decision_condition.',
  })
  oatsConditionId: number;

  @OneToMany(() => ApplicationDecisionConditionComponentPlanNumber, (c) => c.condition, {
    cascade: ['insert', 'update', 'remove'],
  })
  conditionToComponentsWithPlanNumber: ApplicationDecisionConditionComponentPlanNumber[] | null;

  @OneToMany(() => ApplicationDecisionConditionDate, (d) => d.condition, { cascade: ['insert', 'update'] })
  dates: ApplicationDecisionConditionDate[];
}
