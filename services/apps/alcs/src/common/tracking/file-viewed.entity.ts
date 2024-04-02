import { AutoMap } from 'automapper-classes';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  comment: 'Stores when the file(Application, NOI etc.) was last viewed.',
})
export class FileViewed extends BaseEntity {
  constructor(data?: Partial<FileViewed>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    nullable: false,
  })
  fileNumber: string;

  @Column({
    nullable: false,
    type: 'uuid',
  })
  userUuid: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    update: false,
  })
  viewedAt: Date;
}
