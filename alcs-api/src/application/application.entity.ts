import { Base } from '../common/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { User } from '../user/user.entity';

@Entity()
export class Application extends Base {
  @Column({ unique: true })
  fileNumber: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({
    type: 'uuid',
    default: 'e6ddd1af-1cb9-4e45-962a-92e8d532b149',
  })
  statusUuid: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  assigneeUuid: string;

  @ManyToOne((status) => ApplicationStatus)
  status: ApplicationStatus;

  @ManyToOne((assignee) => User, { nullable: true })
  assignee: User;

  @OneToMany(() => ApplicationHistory, (appHistory) => appHistory.application)
  history: ApplicationHistory[];
}
