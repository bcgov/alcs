import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';

@Entity()
export class PlanningReview extends Base {
  constructor(data?: Partial<PlanningReview>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Index()
  @Column({ unique: true })
  fileNumber: string;

  @Column()
  type: string;

  @Column({ type: 'uuid' })
  cardUuid: string;

  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;

  @ManyToOne(() => ApplicationLocalGovernment)
  localGovernment: ApplicationLocalGovernment;

  @Index()
  @Column({
    type: 'uuid',
  })
  localGovernmentUuid: string;

  @ManyToOne(() => ApplicationRegion)
  region: ApplicationRegion;

  @Column()
  regionCode: string;
}
