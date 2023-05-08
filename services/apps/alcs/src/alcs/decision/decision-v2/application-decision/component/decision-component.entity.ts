import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../../../utils/column-numeric-transform';
import { ApplicationDecision } from '../../../application-decision.entity';
import { ApplicationDecisionComponentType } from './decision-component-type.entity';

@Entity()
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

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Non-farm use type',
    nullable: true,
  })
  nfuUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Non-farm use sub type',
    nullable: true,
  })
  nfuUseSubType?: string | null;

  @Column({
    type: 'timestamptz',
    comment: 'The date at which the non-farm use ends',
    nullable: true,
  })
  nfuEndDate?: Date | null;

  @AutoMap()
  @ManyToOne(() => ApplicationDecisionComponentType)
  applicationDecisionComponentType: ApplicationDecisionComponentType;

  @AutoMap()
  @ManyToOne(() => ApplicationDecision)
  applicationDecision: ApplicationDecision;
}
