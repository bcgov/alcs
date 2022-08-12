import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { Base } from '../common/entities/base.entity';
import { User } from '../user/user.entity';
import { ApplicationDecisionMaker } from './application-code/application-decision-maker/application-decision-maker.entity';
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

  @ManyToOne((decisionMaker) => ApplicationDecisionMaker, {
    nullable: true,
  })
  decisionMaker: ApplicationDecisionMaker;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  decisionMakerUuid: string;

  @ManyToOne((decisionMaker) => ApplicationRegion, {
    nullable: true,
  })
  region: ApplicationRegion;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  regionUuid: string;

  @AutoMap()
  @ManyToOne((assignee) => User, { nullable: true })
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
