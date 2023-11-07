import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationDecisionConditionToComponentLot } from '../application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';

export class ProposedLot {
  type: 'Lot' | 'Road Dedication' | null;
  alrArea?: number | null;
  size: number | null;
  planNumbers: string | null;
}

//Contains the approved subdivision lots
@Entity()
export class ApplicationDecisionComponentLot extends Base {
  constructor(data?: Partial<ApplicationDecisionComponentLot>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'int' })
  index: number;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
  })
  type: 'Lot' | 'Road Dedication' | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  alrArea?: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  size?: number | null;

  @AutoMap()
  @Column()
  componentUuid: string;

  @ManyToOne(() => ApplicationDecisionComponent)
  @Type(() => ApplicationDecisionComponent)
  component: ApplicationDecisionComponent;

  @ManyToMany(
    () => ApplicationDecisionConditionToComponentLot,
    (e) => e.componentLot,
    {
      cascade: ['soft-remove', 'insert', 'update', 'remove'],
    },
  )
  conditionLots: ApplicationDecisionConditionToComponentLot[];
}
