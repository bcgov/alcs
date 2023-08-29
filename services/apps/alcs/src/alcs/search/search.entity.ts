import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { Application } from '../application/application.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { LocalGovernment } from '../local-government/local-government.entity';

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
      .select('as2.uuid', 'uuid')
      .addSelect('as2.file_number', 'file_number')
      .addSelect('as2.applicant', 'applicant')
      .addSelect('as2.local_government_uuid', 'local_government_uuid')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('as2.type_code', 'application_type_code')
      .addSelect('as2.is_draft', 'is_draft')
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
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'as2.local_government_uuid = localGovernment.uuid',
      ),
})
export class ApplicationSubmissionSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  applicationUuid: string;

  @ViewColumn()
  isDraft: boolean;

  @ViewColumn()
  applicationRegionCode?: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  applicationTypeCode: string;

  @ViewColumn()
  legacyId?: string;

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
