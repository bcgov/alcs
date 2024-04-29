import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for the possible application decision outcomes',
})
export class ApplicationDecisionOutcomeCode extends BaseCodeEntity {
  @Column({
    default: true,
  })
  isFirstDecision: boolean;
}
