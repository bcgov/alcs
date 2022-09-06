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
  type: 'decisionDocument';

  @ManyToOne(() => Application)
  application: Application;

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
