import { Controller, Get, Param } from '@nestjs/common';
import { DocumentService } from '../alcs/document/document.service';
import { DOCUMENT_TYPE } from '../application/application-document/application-document.entity';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/getUploadUrl/:fileId/:documentType')
  getUploadUrl(
    @Param('fileId') fileId: string,
    // this will ensure that the document type is of correct type. Nest will automatically handle validation
    @Param('documentType') documentType: DOCUMENT_TYPE,
  ) {
    return this.documentService.getUploadUrl(`${fileId}/portal`);
  }
}
