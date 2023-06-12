import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { Base } from '../../common/entities/base.entity';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';

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

  @ManyToMany(() => NoticeOfIntentSubtype)
  @JoinTable()
  @AutoMap(() => [NoticeOfIntentSubtype])
  subtype: NoticeOfIntentSubtype[];

  @Column()
  regionCode: string;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  retroactive: boolean | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateSubmittedToAlc: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  feePaidDate: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedIncomplete: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateReceivedAllItems: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedComplete: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  decisionDate: Date | null;
}
