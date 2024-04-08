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
} from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { Inquiry } from '../inquiry.entity';

@Entity({
  comment: 'Stores inquiry documents',
})
export class InquiryDocument extends BaseEntity {
  constructor(data?: Partial<InquiryDocument>) {
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

  @ManyToOne(() => Inquiry, { nullable: false })
  inquiry: Inquiry;

  @Column()
  @Index()
  inquiryUuid: string;

  @Column({ nullable: true, type: 'uuid' })
  documentUuid?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.issues to alcs.inquiry_document.',
  })
  oatsIssueId?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.documents/alcs.documents to alcs.inquiry_document.',
  })
  oatsDocumentId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  auditCreatedBy?: string | null;

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
