import { AutoMap } from '@automapper/classes';
import { DOCUMENT_TYPE } from '../../../portal/application-submission/application-parcel/application-parcel-document/application-parcel-document.entity';
// TODO fix me, used the first one from the list so not sure which is correct
// import { DOCUMENT_TYPE } from '../../../../../portal/src/application-proposal/application-document/application-document.entity';

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
  type?: DOCUMENT_TYPE;
  documentUuid: string;
  description?: string;
}

export class ApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT_TYPE | null;
  description: string | null;
}
