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
import { Document } from '../../document/document.entity';
import { Application } from '../application.entity';

export const DOCUMENT_TYPES = [
  'decisionDocument',
  'reviewDocument',
  'certificateOfTitle',
] as const;
export type DOCUMENT_TYPE =
  | 'decisionDocument'
  | 'reviewDocument'
  | 'certificateOfTitle';

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

  @Column()
  type: string; //FIXME: Automapper hates the DOCUMENT_TYPE type

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
