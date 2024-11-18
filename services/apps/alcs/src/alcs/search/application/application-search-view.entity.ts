import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { Application } from '../../application/application.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';

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
      .select('app_sub.uuid', 'uuid')
      .addSelect('app_sub.file_number', 'file_number')
      .addSelect('app_sub.applicant', 'applicant')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('app.type_code', 'application_type_code')
      .addSelect('app.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('app.decision_date', 'decision_date')
      .addSelect('app.uuid', 'application_uuid')
      .addSelect('app.region_code', 'application_region_code')
      .addSelect('null', 'status')
      .from(ApplicationSubmission, 'app_sub')
      .innerJoin(Application, 'app', 'app.file_number = app_sub.file_number')
      .leftJoin(LocalGovernment, 'localGovernment', 'app_sub.local_government_uuid = localGovernment.uuid')
      .where(`app_sub.is_draft IS NOT TRUE`),
})
export class ApplicationSubmissionSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  applicationUuid: string;

  @ViewColumn()
  applicationRegionCode?: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  applicationTypeCode: string;

  @ViewColumn()
  status: SearchApplicationSubmissionStatusType;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  decisionDate: Date | null;
}
