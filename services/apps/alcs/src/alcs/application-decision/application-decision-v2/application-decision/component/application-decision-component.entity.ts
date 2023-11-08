import { AutoMap } from 'automapper-classes';
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Base } from '../../../../../common/entities/base.entity';
import { NaruSubtype } from '../../../../../portal/application-submission/naru-subtype/naru-subtype.entity';
import { ColumnNumericTransformer } from '../../../../../utils/column-numeric-transform';
import { ApplicationDecisionComponentLot } from '../../../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../../../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionCondition } from '../../../application-decision-condition/application-decision-condition.entity';
import { ApplicationDecision } from '../../../application-decision.entity';
import { ApplicationDecisionComponentType } from './application-decision-component-type.entity';

@Entity()
@Index(['applicationDecisionComponentTypeCode', 'applicationDecisionUuid'], {
  unique: true,
  where: '"audit_deleted_date_at" is null',
})
export class ApplicationDecisionComponent extends Base {
  constructor(data?: Partial<ApplicationDecisionComponent>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
    comment: 'Area in hectares of ALR impacted by the decision component',
  })
  alrArea?: number | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Agricultural cap classification',
    nullable: true,
  })
  agCap?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Agricultural capability classification system used',
    nullable: true,
  })
  agCapSource?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Agricultural capability map sheet reference',
    nullable: true,
  })
  agCapMap?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Consultant who determined the agricultural capability',
    nullable: true,
  })
  agCapConsultant?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Non-farm use type',
    nullable: true,
  })
  nfuType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Non-farm use sub type',
    nullable: true,
  })
  nfuSubType?: string | null;

  @Column({
    type: 'timestamptz',
    comment: 'Components end date',
    nullable: true,
  })
  endDate?: Date | null;

  @Column({
    type: 'timestamptz',
    comment: 'Components second end date (PFRS only)',
    nullable: true,
  })
  endDate2?: Date | null;

  @Column({
    type: 'timestamptz',
    comment: 'Components expiry date',
    nullable: true,
  })
  expiryDate?: Date | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilFillTypeToPlace: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceAverageDepth: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilTypeRemoved: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveAverageDepth: number | null;

  @AutoMap(() => String)
  @Column({ nullable: true })
  naruSubtypeCode: string | null;

  @AutoMap()
  @ManyToOne(() => NaruSubtype)
  naruSubtype: NaruSubtype;

  @AutoMap(() => String)
  @Column({
    nullable: true,
    type: 'text',
    comment: 'Stores the applicant type for inclusion and exclusion components',
  })
  inclExclApplicantType: string | null;

  @AutoMap()
  @Column({ nullable: false })
  applicationDecisionComponentTypeCode: string;

  @AutoMap()
  @ManyToOne(() => ApplicationDecisionComponentType)
  applicationDecisionComponentType: ApplicationDecisionComponentType;

  @Column({ nullable: false })
  applicationDecisionUuid: string;

  @AutoMap()
  @ManyToOne(() => ApplicationDecision, { nullable: false })
  applicationDecision: ApplicationDecision;

  @ManyToMany(
    () => ApplicationDecisionCondition,
    (condition) => condition.components,
  )
  conditions: ApplicationDecisionCondition[];

  @AutoMap(() => [ApplicationDecisionComponentLot])
  @OneToMany(() => ApplicationDecisionComponentLot, (lot) => lot.component, {
    cascade: ['soft-remove', 'insert', 'update'],
  })
  lots: ApplicationDecisionComponentLot[];

  @OneToMany(
    () => ApplicationDecisionConditionComponentPlanNumber,
    (c) => c.component,
    {
      cascade: ['insert', 'update'],
    },
  )
  componentToConditions:
    | ApplicationDecisionConditionComponentPlanNumber[]
    | null;
}
