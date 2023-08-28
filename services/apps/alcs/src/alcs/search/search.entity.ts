import {
  DataSource,
  JoinColumn,
  ManyToOne,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { Application } from '../application/application.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';

export class SearchApplicationSubmissionStatusType {
  submissionUuid: string;
  statusTypeCode: string;
  effectiveDate: Date;
}

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('as2.uuid', 'uuid')
      .addSelect('as2.file_number', 'file_number')
      .addSelect('as2.applicant', 'applicant')
      .addSelect('as2.local_government_uuid', 'local_government_uuid')
      .addSelect('as2.type_code', 'application_type_code')
      .addSelect('a.legacy_id', 'legacy_id')
      .addSelect('a.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('a.decision_date', 'decision_date')
      .addSelect('a.uuid', 'application_uuid')
      .addSelect('a.region_code', 'application_region_code')
      .addSelect(
        'alcs.get_current_status_for_submission_by_uuid(as2.uuid)',
        'status',
      )
      .from(ApplicationSubmission, 'as2')
      .innerJoin(Application, 'a', 'a.file_number = as2.file_number')
      .innerJoinAndSelect(
        ApplicationType,
        'applicationType',
        'as2.type_code = applicationType.code',
      ),
})
export class ApplicationSubmissionSearchView {
  @ViewColumn()
  //   @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  applicationUuid: string;

  @ViewColumn()
  applicationRegionCode: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant: string;

  @ViewColumn()
  localGovernmentUuid: string;

  @ViewColumn()
  applicationTypeCode: string;

  @ViewColumn()
  legacyId: string;

  @ViewColumn()
  status: SearchApplicationSubmissionStatusType;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  decisionDate: Date | null;

  @ManyToOne(() => ApplicationType, {
    nullable: false,
  })
  @JoinColumn({ name: 'application_type_code' })
  applicationType: ApplicationType;
}
