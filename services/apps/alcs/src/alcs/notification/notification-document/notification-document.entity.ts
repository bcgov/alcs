import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { Notification } from '../notification.entity';

export enum VISIBILITY_FLAG {
  APPLICANT = 'A',
  COMMISSIONER = 'C',
  PUBLIC = 'P',
  GOVERNMENT = 'G',
}

@Entity()
export class NotificationDocument extends BaseEntity {
  constructor(data?: Partial<NotificationDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => DocumentCode)
  type?: DocumentCode;

  @Column({ nullable: true })
  typeCode?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  surveyPlanNumber?: string | null;

  @Column({ type: 'text', nullable: true })
  controlNumber?: string | null;

  @ManyToOne(() => Notification, { nullable: false })
  notification: Notification;

  @Column()
  notificationUuid: string;

  @Column({ nullable: true, type: 'uuid' })
  documentUuid?: string | null;

  @AutoMap(() => [String])
  @Column({ default: [], array: true, type: 'text' })
  visibilityFlags: VISIBILITY_FLAG[];

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;

  @Column({
    nullable: true,
    type: 'text',
    comment: 'used only for oats etl process',
  })
  auditCreatedBy?: string | null;
}
