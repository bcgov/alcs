import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CardHistory } from '../application/application-history.entity';
import { CardStatus } from '../application/application-status/application-status.entity';
import { CardSubtask } from '../application/application-subtask/application-subtask.entity';
import { Board } from '../board/board.entity';
import { Comment } from '../comment/comment.entity';
import { Base } from '../common/entities/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Card extends Base {
  @AutoMap()
  @Column({
    type: 'boolean',
    default: false,
  })
  highPriority: boolean;

  @ManyToOne(() => CardStatus, {
    nullable: false,
  })
  status: CardStatus;

  @Column({
    type: 'uuid',
    default: 'f9f4244f-9741-45f0-9724-ce13e8aa09eb',
  })
  statusUuid: string;

  @ManyToOne(() => Board)
  board: Board;

  @Column({
    type: 'uuid',
    default: 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2',
  })
  boardUuid: string;

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
  @OneToMany(() => Comment, (comment) => comment.card)
  comments: Comment[];

  @AutoMap()
  @OneToMany(() => CardSubtask, (subtask) => subtask.card)
  subtasks: CardSubtask[];

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @AutoMap()
  @OneToMany(() => CardHistory, (cardHistory) => cardHistory.card)
  history: CardHistory[];

  // // Place properties that do not create columns here
  // @AutoMap()
  // @OneToOne(() => Application, { nullable: true })
  // application?: Application;
}
