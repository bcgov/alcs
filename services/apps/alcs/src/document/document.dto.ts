import { User } from '../user/user.entity';

// TODO remove this once typeorm issue resolved
export class CreateDocumentDto {
  mimeType: string;
  fileKey: string;
  fileName: string;
  uploadedBy?: User | null;
  source: 'Applicant' | 'Local_Government' | 'ALCS';
  tags: string[];
}
