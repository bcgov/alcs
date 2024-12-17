import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../../common/entities/base.entity';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';

@Entity({ comment: 'Due/end dates for conditions' })
export class NoticeOfIntentDecisionConditionDate extends Base {
  constructor(data?: Partial<NoticeOfIntentDecisionConditionDate>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  date: Date | null;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  completedDate: Date | null;

  @AutoMap()
  @ManyToOne(() => NoticeOfIntentDecisionCondition, {
    cascade: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
    nullable: false,
  })
  condition: NoticeOfIntentDecisionCondition;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  comment: string | null;
}
