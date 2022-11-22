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
import { CardHistory } from './card-history/card-history.entity';
import { CardStatus } from './card-status/card-status.entity';
import { CardSubtask } from './card-subtask/card-subtask.entity';
import { CardType } from './card-type/card-type.entity';

@Entity()
export class Card extends Base {
  constructor(data?: Partial<Card>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

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
    default: 'SUBM',
  })
  statusCode: string;

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

  @AutoMap()
  @ManyToOne(() => CardType)
  type: CardType;

  @Column({
    type: 'text',
    default: 'APP',
    nullable: false,
  })
  typeCode: string;
}
