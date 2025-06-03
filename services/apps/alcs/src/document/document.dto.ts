import { AutoMap } from 'automapper-classes';
import { BaseCodeDto } from '../common/dtos/base.dto';
import { User } from '../user/user.entity';

export enum DOCUMENT_SOURCE {
  // All types
  ALC = 'ALC',
  LFNG = 'L/FNG',
  PUBLIC = 'Public',
  BC_GOVERNMENT = 'BC Government',
  OTHER_AGENCY = 'Other Agency',

  // app, NOI, noti, inquiry, planning review only
  APPLICANT = 'Applicant',
  AFFECTED_PARTY = 'Affected Party',

  // C&E only
  AGENT = 'Agent',
  COMPLAINANT = 'Complainant',
  PROPERTY_OWNER = 'Property Owner',
  TENANT = 'Tenant',
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

export class DocumentTypeDto extends BaseCodeDto {
  @AutoMap()
  oatsCode: string;
}
