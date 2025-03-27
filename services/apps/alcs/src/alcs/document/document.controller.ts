import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocumentService } from '../../document/document.service';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/getDownloadUrlAndFileName/:uuid')
  async getDownloadUrlAndFileName(
    @Param('uuid') uuid: string,
    @Query('isInline') isInline: boolean = false,
  ): Promise<{ url: string; fileName: string }> {
    return await this.documentService.getDownloadUrlAndFileNameByUuid(uuid, isInline);
  }
}
