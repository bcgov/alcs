import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { Card } from '../card/card.entity';
import { Base } from '../common/entities/base.entity';
import { BoardStatus } from './board-status.entity';

@Entity()
export class Board extends Base {
  @AutoMap()
  @Column({ unique: true })
  code: string;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @Column()
  decisionMaker: string;

  @AutoMap()
  @OneToMany(() => BoardStatus, (status) => status.board, {
    eager: true,
  })
  statuses: BoardStatus[];

  @OneToMany(() => Card, (app) => app.board)
  cards: Card[];
}
