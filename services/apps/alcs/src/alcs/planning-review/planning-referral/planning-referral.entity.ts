import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { Card } from '../../card/card.entity';
import { PlanningReview } from '../planning-review.entity';

@Entity({
  comment:
    'Planning Referrals represent each pass of a Planning Review with their own cards',
})
export class PlanningReferral extends Base {
  constructor(data?: Partial<PlanningReferral>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({ type: 'timestamptz' })
  submissionDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  responseDate?: Date | null;

  @AutoMap(() => String)
  @Column({ nullable: true, type: 'text' })
  referralDescription?: string | null;

  @AutoMap(() => String)
  @Column({ nullable: true, type: 'text' })
  responseDescription?: string;

  @ManyToOne(() => PlanningReview)
  @JoinColumn()
  @Type(() => PlanningReview)
  planningReview: PlanningReview;

  @Column({ type: 'uuid' })
  cardUuid: string;

  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;
}
