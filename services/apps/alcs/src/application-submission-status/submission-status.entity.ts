import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ApplicationSubmission } from '../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionStatusType } from './submission-status-type.entity';

@Entity()
export class ApplicationSubmissionToSubmissionStatus extends BaseEntity {
  constructor(data?: Partial<ApplicationSubmissionToSubmissionStatus>) {
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
    () => ApplicationSubmission,
    (submission) => submission.submissionStatuses,
  )
  @JoinColumn({ name: 'submission_uuid' })
  submission: ApplicationSubmission;

  @AutoMap()
  @PrimaryColumn()
  statusTypeCode: string;

  @AutoMap()
  @ManyToOne(
    () => ApplicationSubmissionStatusType,
    (status) => status.submissionStatuses,
    { eager: true },
  )
  @JoinColumn({ name: 'status_type_code' })
  statusType: ApplicationSubmissionStatusType;
}
