import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { DocumentService } from '../alcs/document/document.service';
import {
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from '../application/application-document/application-document.entity';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/getUploadUrl/:fileId/:documentType')
  getUploadUrl(
    @Param('fileId') fileId: string,
    @Param('documentType') documentType: DOCUMENT_TYPE,
  ) {
    if (!DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }
    return this.documentService.getUploadUrl(`${fileId}/portal`);
  }
}
