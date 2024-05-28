import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { NoticeOfIntentDecision } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentType } from '../../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { User } from '../../../user/user.entity';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { LinkedStatusType } from '../inbox.dto';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('noi_sub.uuid', 'uuid')
      .addSelect('noi_sub.file_number', 'file_number')
      .addSelect('noi_sub.applicant', 'applicant')
      .addSelect('noi_sub.audit_created_at', 'created_at')
      .addSelect('noi_sub.created_by_uuid', 'created_by_uuid')
      .addSelect('noi_sub.local_government_uuid', 'local_government_uuid')
      .addSelect('user.bceid_business_guid', 'bceid_business_guid')
      .addSelect('noi_sub.type_code', 'notice_of_intent_type_code')
      .addSelect('noi.uuid', 'notice_of_intent_uuid')
      .addSelect('noi.date_submitted_to_alc', 'date_submitted_to_alc')
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
        'noi.file_number = noi_sub.file_number AND noi.hide_from_portal = false',
      )
      .leftJoin(User, 'user', 'user.uuid = noi_sub.created_by_uuid')
      .innerJoinAndSelect(
        NoticeOfIntentType,
        'noticeOfIntentType',
        'noi_sub.type_code = noticeOfIntentType.code',
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
            .select('MAX("date")', 'date')
            .addSelect('notice_of_intent_uuid', 'notice_of_intent_uuid')
            .groupBy('notice_of_intent_uuid'),
        'decision_date',
        'decision_date."notice_of_intent_uuid" = noi.uuid',
      )
      .where('noi_sub.is_draft = FALSE'),
})
export class InboxNoticeOfIntentSubmissionView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant?: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  createdByUuid: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  bceidBusinessGuid?: string;

  @ViewColumn()
  noticeOfIntentTypeCode: string;

  @ViewColumn()
  noticeOfIntentUuid: string;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  lastUpdate: Date;

  @ViewColumn()
  status: LinkedStatusType;

  @ManyToOne(() => NoticeOfIntentType, {
    nullable: false,
  })
  @JoinColumn({ name: 'notice_of_intent_type_code' })
  noticeOfIntentType: NoticeOfIntentType;
}
