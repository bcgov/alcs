import { AutoMap } from 'automapper-classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auditable } from '../../../common/entities/audit.entity';
import { Document } from '../../../document/document.entity';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';

@Entity({
  comment: "Links NOI decision document with the decision it's saved to",
})
export class NoticeOfIntentDecisionDocument extends Auditable {
  constructor(data?: Partial<NoticeOfIntentDecisionDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => NoticeOfIntentDecision, { nullable: false })
  decision: NoticeOfIntentDecision;

  @Column()
  decisionUuid: string;

  @OneToOne(() => Document, {
    cascade: true,
  })
  @JoinColumn()
  document: Document;
}
