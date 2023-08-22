import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent.dto';

export interface NoticeOfIntentStatusDto extends BaseCodeDto {
  alcsBackgroundColor: string;

  alcsColor: string;

  portalBackgroundColor: string;

  portalColor: string;

  code: NOI_SUBMISSION_STATUS;

  weight: number;
}

export interface NoticeOfIntentSubmissionToSubmissionStatusDto {
  submissionUuid: string;

  effectiveDate: number | null;

  statusTypeCode: string;

  status: NoticeOfIntentStatusDto;
}

export const DEFAULT_NO_STATUS = {
  backgroundColor: '#929292',
  textColor: '#EFEFEF',
  label: 'No Status',
};
