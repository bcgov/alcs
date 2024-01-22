import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { NOTIFICATION_STATUS } from '../notification.dto';

export interface NotificationSubmissionStatusDto extends BaseCodeDto {
  alcsBackgroundColor: string;
  alcsColor: string;
  portalBackgroundColor: string;
  portalColor: string;
  code: NOTIFICATION_STATUS;
  weight: number;
}

export interface NotificationSubmissionToSubmissionStatusDto {
  submissionUuid: string;
  effectiveDate: number | null;
  statusTypeCode: string;
  status: NotificationSubmissionStatusDto;
}

export const DEFAULT_NO_STATUS = {
  backgroundColor: '#929292',
  textColor: '#EFEFEF',
  label: 'No Status',
};
