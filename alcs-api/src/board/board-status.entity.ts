import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ApplicationStatus } from '../application/application-status/application-status.entity';
import { Base } from '../common/entities/base.entity';
import { Board } from './board.entity';

@Entity()
export class BoardStatus extends Base {
  @AutoMap()
  @ManyToOne(() => Board, (board) => board.statuses)
  board: Board;

  @AutoMap()
  @Column()
  order: number;

  @AutoMap()
  @ManyToOne(() => ApplicationStatus, {
    eager: true,
  })
  status: ApplicationStatus;
}
