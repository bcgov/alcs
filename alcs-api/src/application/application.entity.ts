import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Base } from '../common/entities/base.entity';
import { User } from '../user/user.entity';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationType } from './application-type/application-type.entity';

@Entity()
export class Application extends Base {
  @AutoMap()
  @Column({ unique: true })
  fileNumber: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @Column()
  applicant: string;

  @AutoMap()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  assigneeUuid: string;

  @AutoMap()
  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  paused: boolean;

  @ManyToOne((status) => ApplicationStatus, {
    nullable: false,
  })
  status: ApplicationStatus;

  @Column({
    type: 'uuid',
    default: 'e6ddd1af-1cb9-4e45-962a-92e8d532b149',
  })
  statusUuid: string;

  @ManyToOne((type) => ApplicationType, {
    nullable: false,
  })
  type: ApplicationType;

  @Column({
    type: 'uuid',
  })
  typeUuid: string;

  @AutoMap()
  @ManyToOne((assignee) => User, { nullable: true })
  assignee: User;

  @AutoMap()
  @OneToMany(() => ApplicationHistory, (appHistory) => appHistory.application)
  history: ApplicationHistory[];

  @AutoMap()
  @OneToMany(() => ApplicationPaused, (appPaused) => appPaused.application)
  pauses: ApplicationPaused[];
}
