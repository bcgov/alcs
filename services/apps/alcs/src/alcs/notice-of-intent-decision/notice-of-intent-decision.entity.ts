import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentDecisionDocument } from './notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';

@Entity()
@Index(['resolutionNumber', 'resolutionYear'], {
  unique: true,
  where: '"audit_deleted_date_at" is null and "resolution_number" is not null',
})
export class NoticeOfIntentDecision extends Base {
  constructor(data?: Partial<NoticeOfIntentDecision>) {
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
  auditDate: Date | null;

  @AutoMap(() => NoticeOfIntentDecisionOutcome)
  @ManyToOne(() => NoticeOfIntentDecisionOutcome, {
    nullable: false,
  })
  outcome: NoticeOfIntentDecisionOutcome;

  @AutoMap()
  @Column()
  outcomeCode: string;

  @AutoMap()
  @Column({ type: 'int4', nullable: true })
  resolutionNumber: number;

  @AutoMap()
  @Column({ type: 'smallint' })
  resolutionYear: number;

  @AutoMap()
  @Column()
  decisionMaker: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  decisionMakerName?: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    update: false,
    comment:
      'Date that indicates when decision was created. It is not editable by user.',
  })
  createdAt: Date;

  @AutoMap(() => [NoticeOfIntentDecisionDocument])
  @OneToMany(
    () => NoticeOfIntentDecisionDocument,
    (document) => document.decision,
  )
  documents: NoticeOfIntentDecisionDocument[];

  @AutoMap()
  @ManyToOne(() => NoticeOfIntent)
  noticeOfIntent: NoticeOfIntent;

  @AutoMap()
  @Column()
  noticeOfIntentUuid: string;
}
