import { AutoMap } from 'automapper-classes';
import { BaseCodeDto } from '../common/dtos/base.dto';
import { User } from '../user/user.entity';
import { UserDto } from '../user/user.dto';
import { Section } from '../alcs/compliance-and-enforcement/document/document.entity';

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

export class DocumentTypeDto extends BaseCodeDto {
  @AutoMap()
  oatsCode: string;
}

export class DocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  documentUuid: string;

  @AutoMap()
  type?: DocumentTypeDto;

  @AutoMap()
  description?: string;

  @AutoMap()
  visibilityFlags?: string[];

  @AutoMap()
  source: DOCUMENT_SOURCE;

  @AutoMap()
  system: DOCUMENT_SYSTEM;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: UserDto;

  @AutoMap()
  uploadedAt: number;

  @AutoMap()
  evidentiaryRecordSorting?: number;

  @AutoMap()
  fileSize?: number;
}

export class CreateDocumentDto {
  typeCode?: string;
  mimeType: string;
  fileKey: string;
  fileName: string;
  fileSize?: number;
  uploadedBy?: User | null;
  source: DOCUMENT_SOURCE;
  system: DOCUMENT_SYSTEM;
  tags?: string[];
  section?: Section;
}
