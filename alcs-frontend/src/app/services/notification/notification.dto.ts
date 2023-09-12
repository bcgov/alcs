import { BaseCodeDto } from '../../shared/dto/base.dto';
import { LocalGovernmentDto } from '../admin-local-government/admin-local-government.dto';
import { ApplicationRegionDto } from '../application/application-code.dto';
import { CardDto } from '../card/card.dto';

export interface NotificationDto {
  uuid: string;
  fileNumber: string;
  applicant: string;
  card: CardDto;
  dateSubmittedToAlc?: number;
  localGovernment: LocalGovernmentDto;
  region: ApplicationRegionDto;
  summary?: string;
  type: NotificationTypeDto;
  staffObservations?: string;
  proposalEndDate?: number;
}

export enum NOTIFICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  ALC_RESPONSE = 'ALCR', // Response sent
  CANCELLED = 'CANC',
}

export interface UpdateNotificationDto {
  dateSubmittedToAlc?: number;
  localGovernmentUuid?: string;
  summary?: string;
  staffObservations?: string;
  proposalEndDate?: number;
}

export interface NotificationTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface NotificationSubmissionStatusDto extends BaseCodeDto {
  code: NOTIFICATION_STATUS;
  alcsBackgroundColor: string;
  alcsColor: string;
  portalBackgroundColor: string;
  portalColor: string;
  weight: number;
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
  transferees: NotificationTransfereeDto[];
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
  submittersFileNumber: string | null;
  totalArea: number | null;
  hasSurveyPlan: boolean | null;
}

export interface NotificationTransfereeDto {
  uuid: string;
  notificationSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: OwnerTypeDto;
}

export enum OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
}

export interface OwnerTypeDto extends BaseCodeDto {
  code: OWNER_TYPE;
}
