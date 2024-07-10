import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NOI_SUBMISSION_STATUS } from '../../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntent } from '../../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentSubmission } from '../../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { LinkedStatusType } from '../public-search.dto';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('noi_sub.uuid', 'uuid')
      .addSelect('noi_sub.file_number', 'file_number')
      .addSelect('noi_sub.applicant', 'applicant')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('noi_sub.type_code', 'notice_of_intent_type_code')
      .addSelect('noi.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('decision_date.outcome', 'outcome')
      .addSelect(
        'GREATEST(status_link.effective_date,  decision_date.date)',
        'last_update',
      )
      .addSelect(
        'alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noi_sub.uuid)',
        'status',
      )
      .from(NoticeOfIntentSubmission, 'noi_sub')
      .innerJoin(
        NoticeOfIntent,
        'noi',
        'noi.file_number = noi_sub.file_number AND noi.hide_from_portal = FALSE',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'noi_sub.local_government_uuid = localGovernment.uuid',
      )
      .leftJoin(
        (qb) =>
          qb
            .from(NoticeOfIntentSubmissionToSubmissionStatus, 'status_link')
            .select('MAX("effective_date")', 'effective_date')
            .addSelect('submission_uuid', 'submission_uuid')
            .where('effective_date <= NOW()')
            .groupBy('submission_uuid'),
        'status_link',
        'status_link."submission_uuid" = noi_sub.uuid',
      )
      .leftJoin(
        (qb) =>
          qb
            .select('decisiondate', 'date')
            .addSelect('outcome', 'outcome')
            .addSelect('dest_rank', 'dest_rank')
            .distinctOn(['notice_of_intentuuid'])
            .addSelect('notice_of_intentuuid', 'notice_of_intent_uuid')
            .from(
              qb
                .subQuery()
                .select('outcome_code', 'outcome')
                .addSelect('date', 'decisiondate')
                .addSelect('notice_of_intent_uuid', 'notice_of_intentuuid')
                .addSelect(
                  'RANK() OVER (PARTITION BY notice_of_intent_uuid ORDER BY date DESC, audit_created_at DESC)',
                  'dest_rank',
                )
                .where('is_draft = FALSE')
                .andWhere('date <= NOW()')
                .from(NoticeOfIntentDecision, 'decision')
                .getQuery(),
              'decisions',
            )
            .where('dest_rank = 1'),
        'decision_date',
        'decision_date."notice_of_intent_uuid" = noi.uuid',
      )
      .where('noi_sub.is_draft = FALSE')
      .andWhere(
        '(noi.date_received_all_items IS NOT NULL AND noi.date_received_all_items <= NOW())',
      )
      .andWhere(
        `alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noi_sub.uuid)->>'status_type_code' != '${NOI_SUBMISSION_STATUS.CANCELLED}'`,
      ),
})
export class PublicNoticeOfIntentSubmissionSearchView {
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
  noticeOfIntentTypeCode: string;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  outcome: string | null;

  @ViewColumn()
  lastUpdate: Date;

  @ViewColumn()
  status: LinkedStatusType;
}
