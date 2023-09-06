import { BaseCodeDto } from '../../shared/dto/base.dto';
import { NotificationTransfereeDto } from '../notification-transferee/notification-transferee.dto';

export enum NOTIFICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  ALC_RESPONSE = 'ALCR', // Response sent
  CANCELLED = 'CANC',
}

export interface NotificationSubmissionStatusDto extends BaseCodeDto {
  code: NOTIFICATION_STATUS;
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
  contactFirstName: string | null;
  contactLastName: string | null;
  contactOrganization: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}

export interface NotificationSubmissionDetailedDto extends NotificationSubmissionDto {
  purpose: string | null;
}

export interface NotificationSubmissionUpdateDto {
  applicant?: string | null;
  purpose?: string | null;
  localGovernmentUuid?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactOrganization?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}
