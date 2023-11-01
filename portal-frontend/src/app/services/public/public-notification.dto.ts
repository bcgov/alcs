import { NotificationSubmissionStatusDto } from '../notification-submission/notification-submission.dto';
import { PublicDocumentDto, PublicOwnerDto, PublicParcelDto } from './public.dto';

export interface GetPublicNotificationResponseDto {
  submission: PublicNotificationSubmissionDto;
  parcels: PublicParcelDto[];
  documents: PublicDocumentDto[];
}
export interface PublicNotificationSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactOrganization: string | null;
  localGovernmentUuid: string;
  type: string;
  typeCode: string;
  status: NotificationSubmissionStatusDto;
  lastStatusUpdate: number;
  transferees: PublicOwnerDto[];
  submittersFileNumber: string | null;
  purpose: string | null;
  totalArea: number | null;
  hasSurveyPlan: boolean | null;
}
