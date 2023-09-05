import { AutoMap } from '@automapper/classes';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NotificationSubmissionToSubmissionStatus } from '../../alcs/notification/notification-submission-status/notification-status.entity';
import { Notification } from '../../alcs/notification/notification.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { NotificationParcel } from './notification-parcel/notification-parcel.entity';
import { NotificationTransferee } from './notification-transferee/notification-transferee.entity';

@Entity()
export class NotificationSubmission extends Base {
  constructor(data?: Partial<NotificationSubmission>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap({})
  @Column({
    comment: 'File Number of attached SRW',
  })
  fileNumber: string;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment: 'The Applicants name on the application',
    nullable: true,
  })
  applicant?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'uuid',
    comment: 'UUID of the Local Government',
    nullable: true,
  })
  localGovernmentUuid?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment: 'The purpose of the application',
    nullable: true,
  })
  purpose?: string | null;

  @AutoMap()
  @ManyToOne(() => User)
  createdBy: User;

  @AutoMap()
  @Column({
    comment: 'SRW Type Code',
  })
  typeCode: string;

  @AutoMap(() => Notification)
  @ManyToOne(() => Notification)
  @JoinColumn({
    name: 'file_number',
    referencedColumnName: 'fileNumber',
  })
  notification: Notification;

  @OneToMany(
    () => NotificationTransferee,
    (transferee) => transferee.notificationSubmission,
  )
  transferees: NotificationTransferee[];

  @OneToMany(
    () => NotificationParcel,
    (parcel) => parcel.notificationSubmission,
  )
  parcels: NotificationParcel[];

  @OneToMany(
    () => NotificationSubmissionToSubmissionStatus,
    (status) => status.submission,
    {
      eager: true,
      persistence: false,
    },
  )
  submissionStatuses: NotificationSubmissionToSubmissionStatus[] = [];

  private _status: NotificationSubmissionToSubmissionStatus;

  get status(): NotificationSubmissionToSubmissionStatus {
    return this._status;
  }

  private set status(value: NotificationSubmissionToSubmissionStatus) {
    this._status = value;
  }

  @AfterLoad()
  populateCurrentStatus() {
    // using JS date object is intentional for performance reasons
    const now = Date.now();

    for (const status of this.submissionStatuses) {
      const effectiveDate = status.effectiveDate?.getTime();
      const currentEffectiveDate = this.status?.effectiveDate?.getTime();

      if (
        effectiveDate &&
        effectiveDate <= now &&
        (!currentEffectiveDate ||
          effectiveDate > currentEffectiveDate ||
          (effectiveDate === currentEffectiveDate &&
            status.statusType.weight > this.status.statusType.weight))
      ) {
        this.status = status;
      }
    }
  }
}
