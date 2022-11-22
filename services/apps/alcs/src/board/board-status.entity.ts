import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { CardStatus } from '../card/card-status/card-status.entity';
import { Base } from '../common/entities/base.entity';
import { Board } from './board.entity';

@Entity()
@Unique(['board', 'status'])
export class BoardStatus extends Base {
  @AutoMap()
  @ManyToOne(() => Board, (board) => board.statuses, { nullable: false })
  board: Board;

  @AutoMap()
  @Column()
  order: number;

  @AutoMap()
  @ManyToOne(() => CardStatus, { eager: true, nullable: false })
  status: CardStatus;
}
