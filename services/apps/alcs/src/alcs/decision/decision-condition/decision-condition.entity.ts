import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationDecision } from '../application-decision.entity';
import { ApplicationDecisionComponent } from '../decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecisionConditionType } from './decision-condition-code.entity';

@Entity()
export class ApplicationDecisionCondition extends Base {
  constructor(data?: Partial<ApplicationDecisionCondition>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({ type: 'boolean', nullable: true })
  approvalDependant: boolean | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  securityAmount: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  administrativeFee: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => ApplicationDecisionConditionType)
  type: ApplicationDecisionConditionType;

  @Column({ type: 'text', nullable: true })
  typeCode: string | null;

  @ManyToOne(() => ApplicationDecision, { nullable: false })
  decision: ApplicationDecision;

  @Column()
  decisionUuid: string;

  @ManyToOne(() => ApplicationDecisionComponent)
  component: ApplicationDecisionComponent | null;

  @Column({ type: 'uuid', nullable: true })
  componentUuid: string | null;
}
