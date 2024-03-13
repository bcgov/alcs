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

export enum PR_VISIBILITY_FLAG {
  COMMISSIONER = 'C',
}

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

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
