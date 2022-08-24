import { Column, Entity, ManyToOne } from 'typeorm';
import { ApplicationStatus } from '../application/application-status/application-status.entity';
import { Base } from '../common/entities/base.entity';
import { Board } from './board.entity';

@Entity()
export class BoardStatus extends Base {
  @ManyToOne(() => Board, (board) => board.statuses)
  board: Board;

  @Column()
  order: number;

  @ManyToOne(() => ApplicationStatus)
  status: ApplicationStatus;
}
