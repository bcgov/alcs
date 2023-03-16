import { AutoMap } from '@automapper/classes';
import { DOCUMENT_TYPE } from '../../../../../portal/src/application-proposal/application-document/application-document.entity';

export class ApplicationDocumentDto {
  @AutoMap()
  type: string;

  @AutoMap(() => String)
  description?: string;

  @AutoMap()
  uuid: string;

  documentUuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  fileSize?: string;

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
  description?: string;
}

export class ApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT_TYPE | null;
  description: string | null;
}
