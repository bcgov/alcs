import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { AutoMap } from 'automapper-classes';

@Entity({
  comment: 'Code table for the possible application decision condition types',
})
export class ApplicationDecisionConditionType extends BaseCodeEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;
}
