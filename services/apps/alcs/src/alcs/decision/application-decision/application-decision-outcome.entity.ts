import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class DecisionOutcomeCode extends BaseCodeEntity {
  @Column({
    default: true,
  })
  isFirstDecision: boolean;
}
