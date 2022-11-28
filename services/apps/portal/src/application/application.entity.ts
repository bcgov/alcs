import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApplicationDocument } from './application-document/application-document.entity';

@Entity()
export class Application extends BaseEntity {
  constructor(data?: Partial<Application>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryColumn({ unique: true })
  fileNumber: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @AutoMap()
  @Column()
  applicant: string;

  @AutoMap()
  @Column({
    type: 'uuid',
  })
  localGovernmentUuid: string;

  @AutoMap()
  @OneToMany(
    () => ApplicationDocument,
    (appDocument) => appDocument.application,
  )
  documents: ApplicationDocument[];
}
