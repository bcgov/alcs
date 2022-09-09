import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { Application } from '../application.entity';
import { ApplicationSubtaskType } from './application-subtask-type.entity';

@Entity()
export class ApplicationSubtask extends Base {
  constructor(data?: Partial<ApplicationSubtask>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne(() => User)
  assignee: User;

  @Column()
  assigneeUuid?: string;

  @ManyToOne(() => Application)
  application: Application;

  @ManyToOne(() => ApplicationSubtaskType)
  type: ApplicationSubtaskType;
}
