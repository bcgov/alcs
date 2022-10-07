import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Card } from '../../card/card.entity';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../application.entity';
import { ReconsiderationType } from './reconsideration-type/reconsideration-type.entity';

// TODO rename to application reconsideration
@Entity()
export class ApplicationReconsideration extends Base {
  constructor(data?: Partial<ApplicationReconsideration>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  submittedDate: Date;

  @AutoMap()
  @ManyToOne(() => ReconsiderationType, {
    nullable: false,
  })
  type: ReconsiderationType;

  @AutoMap()
  @Column({ nullable: true })
  isReviewApproved: boolean;

  @AutoMap()
  @ManyToOne(() => Application, { cascade: ['insert'] })
  application: Application;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  reviewDate: Date;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid;

  @AutoMap()
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;
}
