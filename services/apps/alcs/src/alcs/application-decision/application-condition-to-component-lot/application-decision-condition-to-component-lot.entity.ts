import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationDecisionComponentLot } from '../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionCondition } from '../application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';

@Entity()
export class ApplicationDecisionConditionToComponentLot extends Base {
  constructor(data?: Partial<ApplicationDecisionConditionToComponentLot>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({
    type: 'text',
  })
  planNumbers?: string | null;

  @Column()
  componentUuid: string;

  @ManyToOne(() => ApplicationDecisionComponent)
  component: ApplicationDecisionComponent;

  @Column({ nullable: true })
  conditionUuid: string;

  @ManyToOne(() => ApplicationDecisionCondition, { nullable: true })
  condition: ApplicationDecisionCondition;

  @ManyToMany(() => ApplicationDecisionComponentLot, (e) => e.conditionLots, {
    cascade: ['soft-remove'],
  })
  componentLot: ApplicationDecisionComponentLot[];
}
