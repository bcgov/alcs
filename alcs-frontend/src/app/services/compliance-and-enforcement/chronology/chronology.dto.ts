import { UserDto } from '../../user/user.dto';
import { ComplianceAndEnforcementDocumentDto } from '../documents/document.dto';

export interface ComplianceAndEnforcementChronologyEntryDto {
  uuid: string;
  isDraft: boolean;
  date: number | null;
  author: UserDto;
  description: string;
  fileUuid: string;
  documents: ComplianceAndEnforcementDocumentDto[];
}

export interface UpdateComplianceAndEnforcementChronologyEntryDto {
  isDraft?: boolean;
  date?: number | null;
  authorUuid?: string;
  description?: string;
  fileUuid?: string;
}
