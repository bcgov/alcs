import { BaseCodeDto } from '../../shared/dto/base.dto';

export enum APPLICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM',
  SUBMITTED_TO_LG = 'SUBG',
  IN_REVIEW = 'REVW',
  REFUSED_TO_FORWARD = 'REFU',
  CANCELLED = 'CANC',
}

export interface ApplicationStatusDto extends BaseCodeDto {}

export interface ApplicationDocumentDto {
  type: string;
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
