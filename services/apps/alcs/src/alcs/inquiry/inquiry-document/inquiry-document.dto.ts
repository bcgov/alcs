import { AutoMap } from 'automapper-classes';
import { DocumentTypeDto } from '../../../document/document.dto';

export class InquiryDocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap(() => DocumentTypeDto)
  type?: DocumentTypeDto;

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
