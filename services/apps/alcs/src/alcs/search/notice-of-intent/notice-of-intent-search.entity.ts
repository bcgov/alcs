import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentType } from '../../code/application-code/notice-of-intent-type/notice-of-intent-type.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';

// typeorm does not transform property names for the status
export class SearchNoticeOfIntentSubmissionStatusType {
  submission_uuid: string;

  status_type_code: string;

  effective_date: Date;

  label: string;
}

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('nois.uuid', 'uuid')
      .addSelect('nois.file_number', 'file_number')
      .addSelect('nois.applicant', 'applicant')
      .addSelect('nois.local_government_uuid', 'local_government_uuid')
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('nois.type_code', 'notice_of_intent_type_code')
      .addSelect('nois.is_draft', 'is_draft')
      .addSelect('noi.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('noi.decision_date', 'decision_date')
      .addSelect('noi.uuid', 'notice_of_intent_uuid')
      .addSelect('noi.region_code', 'notice_of_intent_region_code')
      .addSelect(
        'alcs.get_current_status_for_notice_of_intent_submission_by_uuid(nois.uuid)',
        'status',
      )
      .from(NoticeOfIntentSubmission, 'nois')
      .innerJoin(NoticeOfIntent, 'noi', 'noi.file_number = nois.file_number')
      .innerJoinAndSelect(
        NoticeOfIntentType,
        'noticeOfIntentType',
        'nois.type_code = noticeOfIntentType.code',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'nois.local_government_uuid = localGovernment.uuid',
      ),
})
export class NoticeOfIntentSubmissionSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  noticeOfIntentUuid: string;

  @ViewColumn()
  isDraft: boolean;

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
  status: SearchNoticeOfIntentSubmissionStatusType;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ViewColumn()
  decisionDate: Date | null;

  @ManyToOne(() => NoticeOfIntentType, {
    nullable: false,
  })
  @JoinColumn({ name: 'notice_of_intent_type_code' })
  noticeOfIntentType: NoticeOfIntentType;
}
