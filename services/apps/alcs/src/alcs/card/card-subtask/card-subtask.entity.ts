import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { User } from '../../../user/user.entity';
import { Card } from '../card.entity';
import { CardSubtaskType } from './card-subtask-type/card-subtask-type.entity';

@Entity({
  comment: 'Attributes for card subtasks',
})
export class CardSubtask extends Base {
  constructor(data?: Partial<CardSubtask>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  completedAt?: Date | null;

  @ManyToOne(() => User)
  assignee?: User;

  @Column({ nullable: true })
  assigneeUuid?: string | null;

  @Column()
  cardUuid?: string;

  @ManyToOne(() => Card)
  card: Card;

  @ManyToOne(() => CardSubtaskType)
  type: CardSubtaskType;
}
