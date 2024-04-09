import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { CardStatus } from '../card/card-status/card-status.entity';
import { Board } from './board.entity';

@Entity({ comment: 'Columns on each kanban board' })
@Unique(['board', 'status'])
export class BoardStatus extends Base {
  constructor(data?: Partial<BoardStatus>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @ManyToOne(() => Board, (board) => board.statuses, { nullable: false })
  board: Board;

  @AutoMap()
  @Column()
  order: number;

  @AutoMap()
  @ManyToOne(() => CardStatus, { eager: true, nullable: false })
  status: CardStatus;

  @Column()
  statusCode: string;
}
