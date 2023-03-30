import { AutoMap } from '@automapper/classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { DOCUMENT_TYPE } from './application-document-code.entity';

export class ApplicationDocumentTypeDto extends BaseCodeDto {
  @AutoMap()
  oatsCode: string;
}

export class ApplicationDocumentDto {
  @AutoMap(() => String)
  description?: string;

  @AutoMap()
  uuid: string;

  @AutoMap(() => ApplicationDocumentTypeDto)
  type?: ApplicationDocumentTypeDto;

  @AutoMap(() => [String])
  visibilityFlags: string[];

  //Document Fields
  documentUuid: string;
  fileName: string;
  fileSize?: number;
  source: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export class PortalApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT_TYPE | null;
  description: string | null;
}
