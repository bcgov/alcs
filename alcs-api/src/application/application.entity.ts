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
import { ApplicationSubtask } from './application-subtask/application-subtask.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationStatus } from './application-status/application-status.entity';

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
    type: 'boolean',
    default: false,
  })
  paused: boolean;

  @AutoMap()
  @Column({
    type: 'boolean',
    default: false,
  })
  highPriority: boolean;

  @AutoMap()
  @Column({
    type: 'timestamptz',
  })
  dateReceived: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  datePaid?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedIncomplete?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateReceivedAllItems?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedComplete?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  decisionDate?: Date;

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
  @Column({
    type: 'uuid',
    nullable: true,
  })
  assigneeUuid: string;

  @AutoMap()
  @OneToMany(() => ApplicationHistory, (appHistory) => appHistory.application)
  history: ApplicationHistory[];

  @AutoMap()
  @OneToMany(() => ApplicationPaused, (appPaused) => appPaused.application)
  pauses: ApplicationPaused[];

  @AutoMap()
  @OneToMany(() => Comment, (comment) => comment.application)
  comments: Comment[];

  @AutoMap()
  @OneToMany(
    () => ApplicationDecisionMeeting,
    (appDecMeeting) => appDecMeeting.application,
  )
  decisionMeetings: ApplicationDecisionMeeting[];

  @AutoMap()
  @OneToMany(() => ApplicationMeeting, (appMeeting) => appMeeting.application)
  applicationMeetings: ApplicationMeeting[];

  @AutoMap()
  @OneToMany(
    () => ApplicationDocument,
    (appDocument) => appDocument.application,
  )
  decisionDocuments: ApplicationDocument[];

  @AutoMap()
  @OneToMany(() => ApplicationSubtask, (subtask) => subtask.application)
  subtasks: ApplicationSubtask[];
}
