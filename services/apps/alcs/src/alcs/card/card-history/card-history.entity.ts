import { Column, Entity, ManyToOne } from 'typeorm';
import { EntityHistory } from '../../../common/entities/history.entity';
import { Card } from '../card.entity';

@Entity({
  comment:
    "History of card status i.e. the column history of the card's journey on boards",
})
export class CardHistory extends EntityHistory {
  constructor() {
    super();
  }

  @Column()
  statusCode: string;

  @ManyToOne(() => Card, (card) => card.history)
  card: Card;
}
