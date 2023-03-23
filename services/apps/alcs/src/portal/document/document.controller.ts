import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import {
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from '../../alcs/application/application-document/application-document.entity';
import { DocumentService } from '../../document/document.service';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/getUploadUrl/:fileId/:documentType')
  getUploadUrl(
    @Param('fileId') fileId: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | 'null',
  ) {
    if (documentType !== 'null' && !DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }
    return this.documentService.getUploadUrl(`${fileId}/portal`);
  }
}
