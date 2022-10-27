import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Application } from '../application/application.entity';
import { Card } from '../card/card.entity';
import { Base } from '../common/entities/base.entity';

@Entity()
export class ApplicationAmendment extends Base {
  constructor(data?: Partial<ApplicationAmendment>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  submittedDate: Date;

  @AutoMap()
  @Column({ nullable: true })
  isReviewApproved: boolean;

  @AutoMap()
  @Column()
  isTimeExtension: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  reviewDate: Date;

  @AutoMap()
  @ManyToOne(() => Application, { cascade: ['insert'] })
  application: Application;

  @AutoMap()
  @Column({ type: 'uuid' })
  applicationUuid: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  cardUuid: string;

  @AutoMap()
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;
}
