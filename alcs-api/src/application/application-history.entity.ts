import { Column, Entity, ManyToOne } from 'typeorm';
import { Card } from '../card/card.entity';
import { EntityHistory } from '../common/entities/history.entity';

@Entity()
export class CardHistory extends EntityHistory {
  constructor() {
    super();
  }

  @Column({
    type: 'uuid',
  })
  statusUuid: string;

  @ManyToOne(() => Card, (card) => card.history)
  card: Card;
}
