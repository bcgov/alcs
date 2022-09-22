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

export const DOCUMENT_TYPES = ['decisionDocument', 'reviewDocument'] as const;
export type DOCUMENT_TYPE = 'decisionDocument' | 'reviewDocument';

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
  type: string; //TODO: Automapper hates the DOCUMENT_TYPE type

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @Column()
  applicationUuid: string;

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
