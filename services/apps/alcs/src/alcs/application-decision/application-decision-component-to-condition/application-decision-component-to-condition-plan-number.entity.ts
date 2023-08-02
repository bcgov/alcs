import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ApplicationDecisionCondition } from '../application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';

@Entity()
export class ApplicationDecisionConditionComponentPlanNumber extends BaseEntity {
  constructor(data?: Partial<ApplicationDecisionConditionComponentPlanNumber>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryColumn({
    type: 'uuid',
  })
  applicationDecisionConditionUuid: string;

  @AutoMap()
  @PrimaryColumn({
    type: 'uuid',
  })
  applicationDecisionComponentUuid: string;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
  })
  planNumbers?: string | null;

  @ManyToOne(
    () => ApplicationDecisionCondition,
    (c) => c.conditionToComponentsWithPlanNumber,
    { persistence: false },
  )
  @JoinColumn({
    name: 'application_decision_condition_uuid',
    referencedColumnName: 'uuid',
  })
  condition: ApplicationDecisionCondition;

  @ManyToOne(
    () => ApplicationDecisionComponent,
    (c) => c.componentToConditions,
    { persistence: false },
  )
  @JoinColumn({
    name: 'application_decision_component_uuid',
    referencedColumnName: 'uuid',
  })
  component: ApplicationDecisionComponent;
}
