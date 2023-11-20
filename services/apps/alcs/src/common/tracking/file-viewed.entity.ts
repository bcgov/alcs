import { AutoMap } from 'automapper-classes';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
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
  })
  userUuid: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    update: false,
  })
  viewedAt: Date;
}
