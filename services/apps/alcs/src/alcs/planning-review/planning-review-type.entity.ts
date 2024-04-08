import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity({ comment: 'Code table for possible Planning Review types' })
export class PlanningReviewType extends BaseCodeEntity {
  constructor(data?: Partial<PlanningReviewType>) {
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
}
