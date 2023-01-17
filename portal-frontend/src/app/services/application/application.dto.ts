import { BaseCodeDto } from '../../shared/dto/base.dto';

export enum APPLICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM',
  SUBMITTED_TO_LG = 'SUBG',
  IN_REVIEW = 'REVW',
  REFUSED_TO_FORWARD = 'REFU',
  CANCELLED = 'CANC',
}

export enum APPLICATION_DOCUMENT {
  CERTIFICATE_OF_TILE = 'certificateOfTitle',
  RESOLUTION_DOCUMENT = 'reviewResolutionDocument',
  STAFF_REPORT = 'reviewStaffReport',
  REVIEW_OTHER = 'reviewOther',
}

export interface ApplicationStatusDto extends BaseCodeDto {}

export interface ApplicationDocumentDto {
  type: APPLICATION_DOCUMENT;
  uuid: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: number;
}

export interface ApplicationDto {
  fileNumber: string;
  createdAt: Date;
  applicant: string;
  type: string;
  localGovernmentUuid: string;
  documents: ApplicationDocumentDto[];
  status: ApplicationStatusDto;
  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
}

export interface UpdateApplicationDto {
  applicant?: string;
  localGovernmentUuid?: string;
  typeCode?: string;
}
