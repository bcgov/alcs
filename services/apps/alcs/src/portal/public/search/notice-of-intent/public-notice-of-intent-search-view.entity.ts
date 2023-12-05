import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecision } from '../../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NOI_SUBMISSION_STATUS } from '../../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentType } from '../../../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
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
      .addSelect('noi_sub.local_government_uuid', 'local_government_uuid')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('noi_sub.type_code', 'notice_of_intent_type_code')
      .addSelect('noi.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('noi.decision_date', 'decision_date')
      .addSelect('decision_date.outcome', 'outcome')
      .addSelect('decision_date.dest_rank', 'dest_rank')
      .addSelect('noi.uuid', 'notice_of_intent_uuid')
      .addSelect('noi.region_code', 'notice_of_intent_region_code')
      .addSelect(
        'GREATEST(status_link.effective_date,  decision_date.date)',
        'last_update',
      )
      .addSelect(
        'alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noi_sub.uuid)',
        'status',
      )
      .from(NoticeOfIntentSubmission, 'noi_sub')
      .innerJoin(NoticeOfIntent, 'noi', 'noi.file_number = noi_sub.file_number')
      .innerJoinAndSelect(
        NoticeOfIntentType,
        'noticeOfIntentType',
        'noi_sub.type_code = noticeOfIntentType.code',
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
            .groupBy('submission_uuid'),
        'status_link',
        'status_link."submission_uuid" = noi_sub.uuid',
      )
      .leftJoin(
        (qb) =>
          qb
            .from(NoticeOfIntentDecision, 'decision_date')
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
  noticeOfIntentUuid: string;

  @ViewColumn()
  lastUpdate: Date;

  @ViewColumn()
  noticeOfIntentRegionCode?: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  noticeOfIntentTypeCode: string;

  @ViewColumn()
  status: LinkedStatusType;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  decisionDate: Date | null;

  @ViewColumn()
  destRank: number | null;

  @ViewColumn()
  outcome: string | null;

  @ManyToOne(() => NoticeOfIntentType, {
    nullable: false,
  })
  @JoinColumn({ name: 'notice_of_intent_type_code' })
  noticeOfIntentType: NoticeOfIntentType;
}
