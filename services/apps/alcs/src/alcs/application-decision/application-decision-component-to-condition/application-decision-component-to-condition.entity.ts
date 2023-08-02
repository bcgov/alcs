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

@Entity()
export class ApplicationDecisionConditionComponent extends BaseEntity {
  constructor(data?: Partial<ApplicationDecisionConditionComponent>) {
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
    (c) => c.conditionToComponents,
    { cascade: false, persistence: false },
  )
  @JoinColumn({
    name: 'application_decision_condition_uuid',
    referencedColumnName: 'uuid',
  })
  condition: ApplicationDecisionCondition;
}
