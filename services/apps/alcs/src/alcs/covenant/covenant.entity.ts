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
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { LocalGovernment } from '../local-government/local-government.entity';

@Entity()
export class Covenant extends Base {
  constructor(data?: Partial<Covenant>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Index()
  @Column({ unique: true })
  fileNumber: string;

  @Column()
  applicant: string;

  @Column({ type: 'uuid' })
  cardUuid: string;

  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;

  @ManyToOne(() => LocalGovernment)
  localGovernment: LocalGovernment;

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
