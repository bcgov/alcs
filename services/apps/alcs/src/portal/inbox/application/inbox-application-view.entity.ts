import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../../alcs/application/application.entity';
import { ApplicationType } from '../../../alcs/code/application-code/application-type/application-type.entity';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';
import { ApplicationSubmission } from '../../application-submission/application-submission.entity';
import { LinkedStatusType } from '../inbox.dto';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('app_sub.uuid', 'uuid')
      .addSelect('app_sub.file_number', 'file_number')
      .addSelect('app_sub.applicant', 'applicant')
      .addSelect('app_sub.created_by_uuid', 'created_by_uuid')
      .addSelect('app_sub.local_government_uuid', 'local_government_uuid')
      .addSelect('app_sub.audit_created_at', 'created_at')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('localGovernment.bceid_business_guid', 'bceid_business_guid')
      .addSelect('app_sub.type_code', 'application_type_code')
      .addSelect('app.uuid', 'application_uuid')
      .addSelect(
        'app_rev.local_government_file_number',
        'local_government_file_number',
      )
      .addSelect(
        'GREATEST(status_link.effective_date,  decision_date.date)',
        'last_update',
      )
      .addSelect(
        'alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid)',
        'status',
      )
      .from(ApplicationSubmission, 'app_sub')
      .innerJoin(Application, 'app', 'app.file_number = app_sub.file_number')
      .leftJoin(
        ApplicationSubmissionReview,
        'app_rev',
        'app.file_number = app_rev.application_file_number',
      )
      .innerJoinAndSelect(
        ApplicationType,
        'applicationType',
        'app_sub.type_code = applicationType.code',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'app_sub.local_government_uuid = localGovernment.uuid',
      )
      .leftJoin(
        (qb) =>
          qb
            .from(ApplicationSubmissionToSubmissionStatus, 'status_link')
            .select('MAX("effective_date")', 'effective_date')
            .addSelect('submission_uuid', 'submission_uuid')
            .groupBy('submission_uuid'),
        'status_link',
        'status_link."submission_uuid" = app_sub.uuid',
      )
      .leftJoin(
        (qb) =>
          qb
            .from(ApplicationDecision, 'decision_date')
            .select('MAX("date")', 'date')
            .addSelect('application_uuid', 'application_uuid')
            .groupBy('application_uuid'),
        'decision_date',
        'decision_date."application_uuid" = app.uuid',
      )
      .where('app_sub.is_draft = FALSE'),
})
export class InboxApplicationSubmissionView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  applicationUuid: string;

  @ViewColumn()
  lastUpdate: Date;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  createdByUuid: string;

  @ViewColumn()
  bceidBusinessGuid?: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  localGovernmentFileNumber?: string;

  @ViewColumn()
  applicationTypeCode: string;

  @ViewColumn()
  status: LinkedStatusType;

  @ManyToOne(() => ApplicationType, {
    nullable: false,
  })
  @JoinColumn({ name: 'application_type_code' })
  applicationType: ApplicationType;
}
