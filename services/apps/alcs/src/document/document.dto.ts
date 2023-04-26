import { User } from '../user/user.entity';

export enum DOCUMENT_SOURCE {
  APPLICANT = 'Applicant',
  ALC = 'ALC',
  LFNG = 'L/FNG',
  AFFECTED_PARTY = 'Affected Party',
  PUBLIC = 'Public',
}

export enum DOCUMENT_SYSTEM {
  ALCS = 'ALCS',
  PORTAL = 'Portal',
}

export class CreateDocumentDto {
  mimeType: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: User | null;
  source: DOCUMENT_SOURCE;
  system: DOCUMENT_SYSTEM;
}
