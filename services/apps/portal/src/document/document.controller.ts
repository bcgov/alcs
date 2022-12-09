import { Controller, Get, Param } from '@nestjs/common';
import { DocumentService } from '../alcs/document/document.service';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/getUploadUrl/:fileId')
  getUploadUrl(@Param('fileId') fileId: string) {
    return this.documentService.getUploadUrl(`${fileId}/portal`);
  }
}
