import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionStatusType } from './notice-of-intent-status-type.entity';

@Entity()
export class NoticeOfIntentSubmissionToSubmissionStatus extends BaseEntity {
  constructor(data?: Partial<NoticeOfIntentSubmissionToSubmissionStatus>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Date)
  @Column({ type: 'timestamptz', nullable: true })
  effectiveDate: Date | null;

  @AutoMap()
  @PrimaryColumn({ type: 'uuid' })
  submissionUuid: string;

  @AutoMap()
  @ManyToOne(
    () => NoticeOfIntentSubmission,
    (submission) => submission.submissionStatuses,
  )
  @JoinColumn({ name: 'submission_uuid' })
  submission: NoticeOfIntentSubmission;

  @AutoMap()
  @PrimaryColumn()
  statusTypeCode: string;

  @AutoMap()
  @ManyToOne(
    () => NoticeOfIntentSubmissionStatusType,
    (status) => status.submissionStatuses,
    { eager: true },
  )
  @JoinColumn({ name: 'status_type_code' })
  statusType: NoticeOfIntentSubmissionStatusType;
}
