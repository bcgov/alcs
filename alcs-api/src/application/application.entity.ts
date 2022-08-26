import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Board } from '../board/board.entity';
import { Comment } from '../comment/comment.entity';
import { Base } from '../common/entities/base.entity';
import { User } from '../user/user.entity';
import { ApplicationRegion } from './application-code/application-region/application-region.entity';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';

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

  @AutoMap()
  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  highPriority: boolean;

  @ManyToOne(() => ApplicationStatus, {
    nullable: false,
  })
  status: ApplicationStatus;

  @Column({
    type: 'uuid',
    default: 'f9f4244f-9741-45f0-9724-ce13e8aa09eb',
  })
  statusUuid: string;

  @ManyToOne(() => ApplicationType, {
    nullable: false,
  })
  type: ApplicationType;

  @Column({
    type: 'uuid',
  })
  typeUuid: string;

  @ManyToOne(() => Board)
  board: Board;

  @Column({
    type: 'uuid',
    default: 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2',
  })
  boardUuid: string;

  @ManyToOne(() => ApplicationRegion, {
    nullable: true,
  })
  region: ApplicationRegion;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  regionUuid: string;

  @AutoMap()
  @ManyToOne(() => User, { nullable: true })
  assignee: User;

  @AutoMap()
  @OneToMany(() => ApplicationHistory, (appHistory) => appHistory.application)
  history: ApplicationHistory[];

  @AutoMap()
  @OneToMany(() => ApplicationPaused, (appPaused) => appPaused.application)
  pauses: ApplicationPaused[];

  @AutoMap()
  @OneToMany(() => Comment, (comment) => comment.application)
  comments: Comment[];
}
