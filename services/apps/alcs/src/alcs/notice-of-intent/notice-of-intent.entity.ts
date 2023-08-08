import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { NoticeOfIntentType } from '../code/application-code/notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';

@Entity()
export class NoticeOfIntent extends Base {
  constructor(data?: Partial<NoticeOfIntent>) {
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

  @Column({ type: 'uuid', nullable: true })
  cardUuid: string;

  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card | null;

  @ManyToOne(() => LocalGovernment, { nullable: true })
  localGovernment?: LocalGovernment;

  @Index()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  localGovernmentUuid?: string;

  @ManyToOne(() => ApplicationRegion, { nullable: true })
  region?: ApplicationRegion;

  @Column({ nullable: true })
  regionCode?: string;

  @ManyToMany(() => NoticeOfIntentSubtype)
  @JoinTable()
  @AutoMap(() => [NoticeOfIntentSubtype])
  subtype: NoticeOfIntentSubtype[];

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

  @ManyToOne(() => NoticeOfIntentType, {
    nullable: false,
  })
  type: NoticeOfIntentType;

  @Column()
  typeCode: string;
}
