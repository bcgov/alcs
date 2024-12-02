import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../../common/entities/base.entity';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';

@Entity({ comment: 'Due/end dates for conditions' })
export class ApplicationDecisionConditionDate extends Base {
  constructor(data?: Partial<ApplicationDecisionConditionDate>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  date: Date;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  completedDate: Date | null;

  @AutoMap()
  @ManyToOne(() => ApplicationDecisionCondition, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  condition: ApplicationDecisionCondition;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  comment: string;
}
