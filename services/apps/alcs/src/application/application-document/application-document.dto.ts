import { AutoMap } from '@automapper/classes';

export class ApplicationDocumentDto {
  @AutoMap()
  type: string;

  @AutoMap()
  uuid: string;

  documentUuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;
}

export class ApplicationDocumentCreateDto {
  type: string;
  documentUuid: string;
}
