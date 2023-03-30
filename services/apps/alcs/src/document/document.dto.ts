import { User } from '../user/user.entity';

export enum DOCUMENT_SOURCE {
  APPLICANT = 'Applicant',
  ALCS = 'ALCS',
  LFNG = 'Local Government',
  AFFECTED_PARTY = 'Affected Party',
  PUBLIC = 'Public',
}

export class CreateDocumentDto {
  mimeType: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: User | null;
  source: DOCUMENT_SOURCE;
}
