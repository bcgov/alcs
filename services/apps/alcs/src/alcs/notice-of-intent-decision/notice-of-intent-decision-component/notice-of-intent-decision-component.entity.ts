import { AutoMap } from '@automapper/classes';
import { Column, Entity, Index, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionComponentType } from './notice-of-intent-decision-component-type.entity';

@Entity()
@Index(
  ['noticeOfIntentDecisionComponentTypeCode', 'noticeOfIntentDecisionUuid'],
  {
    unique: true,
    where: '"audit_deleted_date_at" is null',
  },
)
export class NoticeOfIntentDecisionComponent extends Base {
  constructor(data?: Partial<NoticeOfIntentDecisionComponent>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
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
    comment: 'Components` expiry date',
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
    precision: 12,
    scale: 2,
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
    precision: 12,
    scale: 2,
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

  @AutoMap()
  @Column({ nullable: false })
  noticeOfIntentDecisionComponentTypeCode: string;

  @AutoMap()
  @ManyToOne(() => NoticeOfIntentDecisionComponentType)
  noticeOfIntentDecisionComponentType: NoticeOfIntentDecisionComponentType;

  @Column({ nullable: false })
  noticeOfIntentDecisionUuid: string;

  @AutoMap()
  @ManyToOne(() => NoticeOfIntentDecision, { nullable: false })
  noticeOfIntentDecision: NoticeOfIntentDecision;

  @ManyToMany(
    () => NoticeOfIntentDecisionCondition,
    (condition) => condition.components,
  )
  conditions: NoticeOfIntentDecisionCondition[];
}
