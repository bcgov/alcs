import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { Base } from '../../common/entities/base.entity';

@Entity()
export class NoticeOfIntent extends Base {
  constructor(data?: Partial<NoticeOfIntent>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({ unique: true })
  fileNumber: string;

  @Column()
  applicant: string;

  @Column({ type: 'uuid', nullable: true })
  cardUuid: string;

  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card | null;

  @ManyToOne(() => ApplicationLocalGovernment)
  localGovernment: ApplicationLocalGovernment;

  @Column({
    type: 'uuid',
  })
  localGovernmentUuid: string;

  @ManyToOne(() => ApplicationRegion)
  region: ApplicationRegion;

  @Column()
  regionCode: string;
}
