import { AutoMap } from 'automapper-classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationSubmissionStatusType } from './notification-status-type.entity';

@Entity()
export class NotificationSubmissionToSubmissionStatus extends BaseEntity {
  constructor(data?: Partial<NotificationSubmissionToSubmissionStatus>) {
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
    () => NotificationSubmission,
    (submission) => submission.submissionStatuses,
  )
  @JoinColumn({ name: 'submission_uuid' })
  submission: NotificationSubmission;

  @AutoMap()
  @PrimaryColumn()
  statusTypeCode: string;

  @AutoMap()
  @ManyToOne(
    () => NotificationSubmissionStatusType,
    (status) => status.submissionStatuses,
    { eager: true },
  )
  @JoinColumn({ name: 'status_type_code' })
  statusType: NotificationSubmissionStatusType;
}
