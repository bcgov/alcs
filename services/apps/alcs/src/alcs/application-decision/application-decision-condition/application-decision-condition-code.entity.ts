import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { AutoMap } from 'automapper-classes';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';

export enum DateLabel {
  DUE_DATE = 'Due Date',
  END_DATE = 'End Date',
}

export enum DateType {
  SINGLE = 'Single',
  MULTIPLE = 'Multiple',
}

@Entity({
  comment: 'Code table for the possible application decision condition types',
})
export class ApplicationDecisionConditionType extends BaseCodeEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ApplicationDecisionCondition, (condition) => condition.type)
  conditions: ApplicationDecisionCondition[];

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
  @Column({ type: 'enum', enum: DateType, nullable: true })
  dateType: DateType | null;

  @AutoMap()
  @Column({ type: 'enum', enum: DateLabel, nullable: true })
  singleDateLabel: DateLabel | null;

  @AutoMap()
  @Column({ default: false, type: 'boolean' })
  isSecurityAmountChecked: boolean;

  @AutoMap()
  @Column({ nullable: true, type: 'boolean' })
  isSecurityAmountRequired: boolean | null;
}
