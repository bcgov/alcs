import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationDecisionConditionComponent } from '../application-decision-component-to-condition/application-decision-component-to-condition.entity';
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
    { nullable: true, cascade: false },
  )
  @JoinTable({
    name: 'application_decision_condition_component',
    // joinColumn: {
    //   name: 'application_decision_condition_uuid',
    //   referencedColumnName: 'uuid',
    // },
    // inverseJoinColumn: {
    //   name: 'application_decision_component_uuid',
    //   referencedColumnName: 'uuid',
    // },
  })
  components: ApplicationDecisionComponent[] | null;

  @OneToMany(() => ApplicationDecisionConditionComponent, (c) => c.condition, {
    cascade: ['insert', 'update'],
    // orphanedRowAction: 'delete',
    // cascade: false,
    // persistence: false,
  })
  // @JoinColumn({
  //   name: 'uuid',
  //   referencedColumnName: 'application_decision_condition_uuid',
  // })
  conditionToComponents: ApplicationDecisionConditionComponent[] | null;
}
