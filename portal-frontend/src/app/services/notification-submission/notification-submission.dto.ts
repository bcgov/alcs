import { BaseCodeDto } from '../../shared/dto/base.dto';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent-submission/notice-of-intent-submission.dto';
import { NotificationTransfereeDto } from '../notification-transferee/notification-transferee.dto';

export enum NOTIFICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  ALC_RESPONSE = 'ALCR', // Response sent
  CANCELLED = 'CANC',
}

export interface NotificationSubmissionStatusDto extends BaseCodeDto {
  code: NOI_SUBMISSION_STATUS;
  portalBackgroundColor: string;
  portalColor: string;
}

export interface NotificationSubmissionToSubmissionStatusDto {
  submissionUuid: string;
  effectiveDate: number | null;
  statusTypeCode: string;
  status: NotificationSubmissionStatusDto;
}

export interface NotificationSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  type: string;
  typeCode: string;
  status: NotificationSubmissionStatusDto;
  lastStatusUpdate: number;
  owners: NotificationTransfereeDto[];
  canEdit: boolean;
  canView: boolean;
}

export interface NotificationSubmissionDetailedDto extends NotificationSubmissionDto {
  purpose: string | null;
}

export interface NotificationSubmissionUpdateDto {
  applicant?: string | null;
  purpose?: string | null;
  localGovernmentUuid?: string | null;
}
