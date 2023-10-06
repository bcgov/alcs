import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { PublicApplicationService } from './public-application.service';

@Public()
@Controller('/public')
export class PublicController {
  constructor(private publicAppService: PublicApplicationService) {}

  @Get('/application/:fileId')
  async getApplication(@Param('fileId') fileNumber: string) {
    return await this.publicAppService.getPublicApplicationData(fileNumber);
  }

  @Get('/application/:fileId/:uuid/download')
  async getApplicationDocumentDownload(
    @Param('fileId') fileId: string,
    @Param('uuid') documentUuid: string,
  ) {
    const url = await this.publicAppService.getDownloadUrl(documentUuid);

    return {
      url,
    };
  }

  @Get('/application/:fileId/:uuid/open')
  async getApplicationDocumentOpen(
    @Param('fileId') fileId: string,
    @Param('uuid') documentUuid: string,
  ) {
    const url = await this.publicAppService.getInlineUrl(documentUuid);

    return {
      url,
    };
  }
}
