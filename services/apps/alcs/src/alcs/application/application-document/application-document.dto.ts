import { AutoMap } from '@automapper/classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

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

  @AutoMap(() => [Number])
  evidentiaryRecordSorting?: number;

  //Document Fields
  documentUuid: string;
  fileName: string;
  fileSize?: number;
  source: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}
