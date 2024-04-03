import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { Card } from '../../card/card.entity';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentModificationOutcomeType } from './notice-of-intent-modification-outcome-type/notice-of-intent-modification-outcome-type.entity';

@Entity({
  comment: 'NOI modification requests linked to card and application',
})
export class NoticeOfIntentModification extends Base {
  constructor(data?: Partial<NoticeOfIntentModification>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({ type: 'timestamptz' })
  submittedDate: Date;

  @AutoMap()
  @Column({ type: 'text', default: 'PEN' })
  reviewOutcomeCode: string;

  @AutoMap()
  @ManyToOne(() => NoticeOfIntentModificationOutcomeType, {
    nullable: false,
  })
  reviewOutcome: NoticeOfIntentModificationOutcomeType;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Modification description provided by ALCS staff',
  })
  description?: string;

  @AutoMap()
  @ManyToOne(() => NoticeOfIntent, { cascade: ['insert'] })
  noticeOfIntent: NoticeOfIntent;

  @AutoMap()
  @Column({ type: 'uuid' })
  noticeOfIntentUuid: string;

  @AutoMap()
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card | null;

  @AutoMap()
  @Column({ type: 'uuid', nullable: true })
  cardUuid: string | null;

  @ManyToMany(() => NoticeOfIntentDecision, (decision) => decision.modifiedBy)
  @JoinTable({
    name: 'notice_of_intent_modified_decisions',
  })
  modifiesDecisions: NoticeOfIntentDecision[];

  @OneToOne(() => NoticeOfIntentDecision, (dec) => dec.modifies)
  resultingDecision?: NoticeOfIntentDecision;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_reconsideration_requests to alcs.notice_of_intent_modification.',
  })
  oatsReconsiderationRequestId: number;
}
