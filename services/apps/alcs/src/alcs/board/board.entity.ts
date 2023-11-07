import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { CardType } from '../card/card-type/card-type.entity';
import { Card } from '../card/card.entity';
import { BoardStatus } from './board-status.entity';

@Entity()
export class Board extends Base {
  constructor(data?: Partial<Board>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ unique: true })
  code: string;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @OneToMany(() => BoardStatus, (status) => status.board, {
    eager: true,
  })
  statuses: BoardStatus[];

  @OneToMany(() => Card, (app) => app.board)
  cards: Card[];

  @ManyToMany(() => CardType)
  @JoinTable()
  allowedCardTypes: CardType[];

  @ManyToMany(() => CardType)
  @JoinTable()
  createCardTypes: CardType[];

  @AutoMap()
  @Column({})
  showOnSchedule: boolean;
}
