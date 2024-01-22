import { AutoMap } from 'automapper-classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { NoticeOfIntent } from '../notice-of-intent.entity';

export enum VISIBILITY_FLAG {
  APPLICANT = 'A',
  COMMISSIONER = 'C',
  PUBLIC = 'P',
  GOVERNMENT = 'G',
}

@Unique('OATS_NOI_UQ_DOCUMENTS', ['oatsDocumentId', 'oatsApplicationId'])
@Entity()
export class NoticeOfIntentDocument extends BaseEntity {
  constructor(data?: Partial<NoticeOfIntentDocument>) {
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

  @ManyToOne(() => NoticeOfIntent, { nullable: false })
  noticeOfIntent: NoticeOfIntent;

  @Column()
  noticeOfIntentUuid: string;

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
  oatsDocumentId?: string | null;

  @Column({
    nullable: true,
    type: 'text',
    comment: 'used only for oats etl process',
  })
  oatsApplicationId?: string | null;

  @Column({
    nullable: true,
    type: 'text',
    comment: 'used only for oats etl process',
  })
  auditCreatedBy?: string | null;
}
