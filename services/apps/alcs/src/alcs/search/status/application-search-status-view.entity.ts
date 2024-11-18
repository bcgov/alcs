import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';

// typeorm does not transform property names for the status
export class SearchApplicationSubmissionStatusType {
  submission_uuid: string;

  status_type_code: string;

  effective_date: Date;

  label: string;
}

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('app_sub.file_number', 'file_number')
      .addSelect('alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid)', 'status')
      .from(ApplicationSubmission, 'app_sub')
      .where(`app_sub.is_draft IS NOT TRUE`),
})
export class ApplicationSubmissionStatusSearchView {
  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  status: SearchApplicationSubmissionStatusType;
}
