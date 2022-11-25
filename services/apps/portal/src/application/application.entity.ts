import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApplicationDocument } from './application-document/application-document.entity';

@Entity()
export class Application {
  constructor(data?: Partial<Application>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @PrimaryColumn({ unique: true })
  fileNumber: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  applicant: string;

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
