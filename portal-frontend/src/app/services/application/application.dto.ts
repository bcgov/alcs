import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface ApplicationStatusDto extends BaseCodeDto {}

export interface ApplicationDocumentDto {
  type: string;
  uuid: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
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
}
