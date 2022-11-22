import { Column, Entity, ManyToOne } from 'typeorm';
import { Card } from '../card.entity';
import { EntityHistory } from '../../common/entities/history.entity';

@Entity()
export class CardHistory extends EntityHistory {
  constructor() {
    super();
  }

  @Column()
  statusCode: string;

  @ManyToOne(() => Card, (card) => card.history)
  card: Card;
}
