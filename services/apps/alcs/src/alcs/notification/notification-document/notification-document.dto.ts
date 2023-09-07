import { AutoMap } from '@automapper/classes';
import { DocumentTypeDto } from '../../../document/document.dto';

export class NotificationDocumentDto {
  @AutoMap(() => String)
  description?: string;

  @AutoMap()
  uuid: string;

  @AutoMap(() => DocumentTypeDto)
  type?: DocumentTypeDto;

  @AutoMap(() => [String])
  visibilityFlags: string[];

  @AutoMap(() => [Number])
  evidentiaryRecordSorting?: number;

  //Document Fields
  documentUuid: string;
  fileName: string;
  fileSize?: number;
  source: string;
  system: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}
