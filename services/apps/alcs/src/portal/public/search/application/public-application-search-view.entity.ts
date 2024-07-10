import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { ApplicationDecision } from '../../../../alcs/application-decision/application-decision.entity';
import { SUBMISSION_STATUS } from '../../../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../../../alcs/application/application.entity';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { ApplicationSubmission } from '../../../application-submission/application-submission.entity';
import { LinkedStatusType } from '../public-search.dto';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('app_sub.uuid', 'uuid')
      .addSelect('app_sub.file_number', 'file_number')
      .addSelect('app_sub.applicant', 'applicant')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('app_sub.type_code', 'application_type_code')
      .addSelect('app.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('decision_date.outcome', 'outcome')
      .addSelect(
        'GREATEST(status_link.effective_date,  decision_date.date)',
        'last_update',
      )
      .addSelect(
        'alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid)',
        'status',
      )
      .from(ApplicationSubmission, 'app_sub')
      .innerJoin(
        Application,
        'app',
        'app.file_number = app_sub.file_number AND app.hide_from_portal = FALSE',
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
            .where('effective_date <= NOW()')
            .groupBy('submission_uuid'),
        'status_link',
        'status_link."submission_uuid" = app_sub.uuid',
      )
      .leftJoin(
        (qb) =>
          qb
            .select('decisiondate', 'date')
            .addSelect('outcome', 'outcome')
            .addSelect('dest_rank', 'dest_rank')
            .distinctOn(['application_uuid'])
            .addSelect('applicationuuid', 'application_uuid')
            .from(
              qb
                .subQuery()
                .select('outcome_code', 'outcome')
                .addSelect('date', 'decisiondate')
                .addSelect('application_uuid', 'applicationuuid')
                .addSelect(
                  'RANK() OVER (PARTITION BY application_uuid ORDER BY date DESC, audit_created_at DESC)',
                  'dest_rank',
                )
                .where('is_draft = FALSE')
                .andWhere('date <= NOW()')
                .from(ApplicationDecision, 'decision')
                .getQuery(),
              'decisions',
            )
            .where('dest_rank = 1'),
        'decision_date',
        'decision_date."application_uuid" = app.uuid',
      )
      .where('app_sub.is_draft = FALSE')
      .andWhere(
        '(app.date_received_all_items IS NOT NULL AND app.date_received_all_items <= NOW())',
      )
      .andWhere(
        `alcs.get_current_status_for_application_submission_by_uuid(app_sub.uuid)->>'status_type_code' != '${SUBMISSION_STATUS.CANCELLED}'`,
      ),
})
export class PublicApplicationSubmissionSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  lastUpdate: Date;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  applicationTypeCode: string;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  outcome: string | null;

  @ViewColumn()
  status: LinkedStatusType;
}
