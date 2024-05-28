import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { Notification } from '../../../../alcs/notification/notification.entity';
import { NotificationSubmission } from '../../../notification-submission/notification-submission.entity';
import { LinkedStatusType } from '../public-search.dto';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('noti_sub.uuid', 'uuid')
      .addSelect('noti_sub.file_number', 'file_number')
      .addSelect('noti_sub.applicant', 'applicant')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('noti.type_code', 'notification_type_code')
      .addSelect('noti.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect(
        'alcs.get_current_status_for_notification_submission_by_uuid(noti_sub.uuid)',
        'status',
      )
      .from(NotificationSubmission, 'noti_sub')
      .innerJoin(
        Notification,
        'noti',
        'noti.file_number = noti_sub.file_number',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'noti.local_government_uuid = localGovernment.uuid',
      )
      .where(
        "alcs.get_current_status_for_notification_submission_by_uuid(noti_sub.uuid)->>'status_type_code' = 'ALCR'",
      ),
})
export class PublicNotificationSubmissionSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  notificationTypeCode: string;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  status: LinkedStatusType;
}
