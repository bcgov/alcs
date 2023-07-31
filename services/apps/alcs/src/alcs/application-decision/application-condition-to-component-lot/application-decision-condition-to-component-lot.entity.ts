import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationDecisionComponentLot } from '../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionCondition } from '../application-decision-condition/application-decision-condition.entity';

@Entity()
export class ApplicationDecisionConditionToComponentLot extends Base {
  constructor(data?: Partial<ApplicationDecisionConditionToComponentLot>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => String)
  @Column({
    type: 'text',
  })
  planNumbers?: string | null;

  @AutoMap()
  @Column({ nullable: true })
  conditionUuid: string;

  @ManyToOne(() => ApplicationDecisionCondition, { nullable: true })
  condition: ApplicationDecisionCondition;

  @AutoMap()
  @Column()
  componentLotUuid: string;

  @ManyToOne(() => ApplicationDecisionComponentLot, {
    cascade: ['soft-remove'],
  })
  componentLot: ApplicationDecisionComponentLot;
}
