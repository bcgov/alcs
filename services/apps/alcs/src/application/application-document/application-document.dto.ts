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
  @AutoMap()
  type: string;

  @AutoMap()
  applicationFileNumber: string;

  @AutoMap()
  uploadedByUuid?: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  fileKey: string;

  @AutoMap()
  source: 'ALCS' | 'Local_Government' | 'Applicant';

  tags: string[];
}
