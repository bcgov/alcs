import { NotificationTransfereeDto } from '../notification-transferee/notification-transferee.dto';

export interface NotificationSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  type: string;
  typeCode: string;
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
