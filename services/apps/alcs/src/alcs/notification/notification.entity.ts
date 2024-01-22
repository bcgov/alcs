import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NotificationDocument } from './notification-document/notification-document.entity';
import { NotificationType } from './notification-type/notification-type.entity';

@Entity()
export class Notification extends Base {
  constructor(data?: Partial<Notification>) {
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

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateSubmittedToAlc?: Date | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'ALC Staff Observations and Comments',
    nullable: true,
  })
  staffObservations?: string | null;

  @ManyToOne(() => NotificationType, {
    nullable: false,
  })
  type: NotificationType;

  @Column()
  typeCode: string;

  @AutoMap()
  @OneToMany(() => NotificationDocument, (document) => document.notification)
  documents: NotificationDocument[];
}
