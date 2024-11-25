import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { AutoMap } from 'automapper-classes';

@Entity({
  comment: 'Decision Condition Types Code Table for Notice of Intents',
})
export class NoticeOfIntentDecisionConditionType extends BaseCodeEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;
}
