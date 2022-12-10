import { AutoMap } from '@automapper/classes';

export class ApplicationDocumentDto {
  @AutoMap()
  type: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;
}

export class ApplicationDocumentExternalAttachDto {
  type: string;

  applicationFileNumber: string;

  uploadedByUuid?: string;

  mimeType: string;

  fileName: string;

  fileKey: string;

  source: 'ALCS' | 'Local_Government' | 'Applicant';
}
