import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { AutoMap } from 'automapper-classes';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';

@Entity({
  comment: 'Decision Condition Types Code Table for Notice of Intents',
})
export class NoticeOfIntentDecisionConditionType extends BaseCodeEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => NoticeOfIntentDecisionCondition, (condition) => condition.type)
  conditions: NoticeOfIntentDecisionCondition[];
}
