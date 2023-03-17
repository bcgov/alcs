import { User } from '../user/user.entity';

export type DOCUMENT_SOURCE_TYPE = 'Applicant' | 'Local_Government' | 'ALCS';

export class CreateDocumentDto {
  mimeType: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: User | null;
  source: DOCUMENT_SOURCE_TYPE;
}
