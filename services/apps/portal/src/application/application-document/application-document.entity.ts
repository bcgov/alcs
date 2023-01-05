import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Application } from '../application.entity';

export const DOCUMENT_TYPES = ['certificateOfTitle'] as const;
export type DOCUMENT_TYPE = 'certificateOfTitle';

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
  type: string;

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @Column()
  alcsDocumentUuid: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @ManyToOne(() => User, (user) => user.documents, {
    nullable: false,
    eager: true,
  })
  uploadedBy: User;
}
