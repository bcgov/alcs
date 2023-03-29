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
import { Document } from '../../../document/document.entity';
import { Application } from '../application.entity';
import { ApplicationDocumentCode } from './application-document-code.entity';

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

  @ManyToOne(() => ApplicationDocumentCode)
  type?: ApplicationDocumentCode;

  @Column({ nullable: true })
  typeCode?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @Column()
  applicationUuid: string;

  @Column({ nullable: true })
  documentUuid?: string | null;

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
