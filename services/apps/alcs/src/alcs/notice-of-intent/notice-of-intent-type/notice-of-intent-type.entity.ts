import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';

@Entity()
export class NoticeOfIntentType extends BaseCodeEntity {
  constructor(data?: Partial<NoticeOfIntentType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column()
  shortLabel: string;

  @AutoMap()
  @Column()
  backgroundColor: string;

  @AutoMap()
  @Column()
  textColor: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  htmlDescription: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  portalLabel: string;

  @AutoMap()
  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  alcFeeAmount?: number;

  @AutoMap()
  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  governmentFeeAmount?: number;
}
