import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { NotificationType } from '../../../alcs/notification/notification-type/notification-type.entity';
import { Notification } from '../../../alcs/notification/notification.entity';
import { User } from '../../../user/user.entity';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { LinkedStatusType } from '../inbox.dto';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('noti_sub.uuid', 'uuid')
      .addSelect('noti_sub.file_number', 'file_number')
      .addSelect('noti_sub.applicant', 'applicant')
      .addSelect('noti_sub.audit_created_at', 'created_at')
      .addSelect('noti_sub.created_by_uuid', 'created_by_uuid')
      .addSelect('noti_sub.local_government_uuid', 'local_government_uuid')
      .addSelect('user.bceid_business_guid', 'bceid_business_guid')
      .addSelect('noti.type_code', 'notification_type_code')
      .addSelect('noti.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('noti.uuid', 'notification_uuid')
      .addSelect(
        'alcs.get_current_status_for_notification_submission_by_uuid(noti_sub.uuid)',
        'status',
      )
      .from(NotificationSubmission, 'noti_sub')
      .leftJoin(User, 'user', 'user.uuid = noti_sub.created_by_uuid')
      .innerJoin(
        Notification,
        'noti',
        'noti.file_number = noti_sub.file_number',
      )
      .innerJoinAndSelect(
        NotificationType,
        'notificationType',
        'noti_sub.type_code = notificationType.code',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'noti.local_government_uuid = localGovernment.uuid',
      ),
})
export class InboxNotificationSubmissionView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  notificationUuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  createdByUuid: string;

  @ViewColumn()
  bceidBusinessGuid?: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  notificationTypeCode: string;

  @ViewColumn()
  status: LinkedStatusType;

  @ManyToOne(() => NotificationType, {
    nullable: false,
  })
  @JoinColumn({ name: 'notification_type_code' })
  notificationType: NotificationType;
}
