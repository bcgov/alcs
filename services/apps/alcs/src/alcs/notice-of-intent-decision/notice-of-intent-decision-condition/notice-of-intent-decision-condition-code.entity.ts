import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { AutoMap } from 'automapper-classes';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { DateLabel } from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';

@Entity({
  comment: 'Decision Condition Types Code Table for Notice of Intents',
})
export class NoticeOfIntentDecisionConditionType extends BaseCodeEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => NoticeOfIntentDecisionCondition, (condition) => condition.type)
  conditions: NoticeOfIntentDecisionCondition[];

  @AutoMap()
  @Column({ default: true, type: 'boolean' })
  isComponentToConditionChecked: boolean;

  @AutoMap()
  @Column({ default: true, type: 'boolean' })
  isDescriptionChecked: boolean;

  @AutoMap()
  @Column({ default: false, type: 'boolean' })
  isAdministrativeFeeAmountChecked: boolean;

  @AutoMap()
  @Column({ nullable: true, type: 'boolean' })
  isAdministrativeFeeAmountRequired: boolean | null;

  @AutoMap()
  @Column({ nullable: true, type: 'decimal', precision: 8, scale: 2, transformer: new ColumnNumericTransformer() })
  administrativeFeeAmount: number | null;

  @AutoMap()
  @Column({ default: false, type: 'boolean' })
  isDateChecked: boolean;

  @AutoMap()
  @Column({ nullable: true, type: 'boolean' })
  isDateRequired: boolean | null;

  @AutoMap()
  @Column({ nullable: true, type: 'boolean' })
  isSingleDateChecked: boolean | null;

  @AutoMap()
  @Column({ type: 'enum', enum: DateLabel, nullable: true })
  singleDateLabel: DateLabel | null;

  @AutoMap()
  @Column({ nullable: true, type: 'boolean' })
  isMultipleDateChecked: boolean | null;

  @AutoMap()
  @Column({ default: false, type: 'boolean' })
  isSecurityAmountChecked: boolean;

  @AutoMap()
  @Column({ nullable: true, type: 'boolean' })
  isSecurityAmountRequired: boolean | null;
}
