import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';

// typeorm does not transform property names for the status
export class SearchNoiSubmissionStatusType {
  submission_uuid: string;

  status_type_code: string;

  effective_date: Date;

  label: string;
}

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('noi_sub.file_number', 'file_number')
      .addSelect('alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noi_sub.uuid)', 'status')
      .from(NoticeOfIntentSubmission, 'noi_sub')
      .where(`noi_sub.is_draft IS NOT TRUE`),
})
export class NoiSubmissionStatusSearchView {
  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  status: SearchNoiSubmissionStatusType;
}
