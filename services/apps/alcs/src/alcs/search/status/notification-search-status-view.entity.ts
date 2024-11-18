import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';

// typeorm does not transform property names for the status
export class SearchNotificationSubmissionStatusType {
  submission_uuid: string;

  status_type_code: string;

  effective_date: Date;

  label: string;
}

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('not_sub.file_number', 'file_number')
      .addSelect('alcs.get_current_status_for_notification_submission_by_uuid(not_sub.uuid)', 'status')
      .from(NotificationSubmission, 'not_sub'),
})
export class NotificationSubmissionStatusSearchView {
  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  status: SearchNotificationSubmissionStatusType;
}
