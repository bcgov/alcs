import { AutoMap } from '@automapper/classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { DOCUMENT_TYPE } from '../../../portal/application-submission/application-parcel/application-parcel-document/application-parcel-document.entity';
// TODO fix me, used the first one from the list so not sure which is correct
// import { DOCUMENT_TYPE } from '../../../../../portal/src/application-proposal/application-document/application-document.entity';

export class ApplicationDocumentTypeDto extends BaseCodeDto {}

export class ApplicationDocumentDto {
  @AutoMap(() => String)
  description?: string;

  @AutoMap()
  uuid: string;

  documentUuid: string;
  fileName: string;
  fileSize?: number;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;

  @AutoMap(() => ApplicationDocumentTypeDto)
  type?: ApplicationDocumentTypeDto;
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
