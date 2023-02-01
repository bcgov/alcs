export enum DOCUMENT {
  CERTIFICATE_OF_TILE = 'certificateOfTitle',
  RESOLUTION_DOCUMENT = 'reviewResolutionDocument',
  STAFF_REPORT = 'reviewStaffReport',
  REVIEW_OTHER = 'reviewOther',
  CORPORATE_SUMMARY = 'corporateSummary',
  PROFESSIONAL_REPORT = 'Professional Report',
  PHOTOGRAPH = 'Photograph',
  OTHER = 'Other',
}

export interface ApplicationDocumentDto {
  type: DOCUMENT | null;
  description?: string | null;
  uuid: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: number;
}

export interface ApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT | null;
  description?: string | null;
}
