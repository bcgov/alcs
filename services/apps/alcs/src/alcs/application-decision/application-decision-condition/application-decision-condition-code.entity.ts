import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { AutoMap } from 'automapper-classes';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';

@Entity({
  comment: 'Code table for the possible application decision condition types',
})
export class ApplicationDecisionConditionType extends BaseCodeEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ApplicationDecisionCondition, (condition) => condition.type)
  conditions: ApplicationDecisionCondition[];
}
