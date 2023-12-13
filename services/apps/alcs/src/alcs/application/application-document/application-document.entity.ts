import { AutoMap } from 'automapper-classes';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { Application } from '../application.entity';

export enum VISIBILITY_FLAG {
  APPLICANT = 'A',
  COMMISSIONER = 'C',
  PUBLIC = 'P',
  GOVERNMENT = 'G',
}

@Unique('OATS_UQ_DOCUMENTS', ['oatsDocumentId', 'oatsApplicationId'])
@Entity()
export class ApplicationDocument extends BaseEntity {
  constructor(data?: Partial<ApplicationDocument>) {
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

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @Column()
  @Index()
  applicationUuid: string;

  @Column({ nullable: true, type: 'uuid' })
  documentUuid?: string | null;

  @Column({ nullable: true, type: 'int' })
  evidentiaryRecordSorting?: number | null;

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
