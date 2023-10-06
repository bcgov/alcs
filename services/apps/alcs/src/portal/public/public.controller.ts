import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { PublicApplicationService } from './application/public-application.service';
import { PublicNoticeOfIntentService } from './notice-of-intent/public-notice-of-intent.service';

@Public()
@Controller('/public')
export class PublicController {
  constructor(
    private publicAppService: PublicApplicationService,
    private publicNoticeOfIntentService: PublicNoticeOfIntentService,
  ) {}

  @Get('/application/:fileId')
  async getApplication(@Param('fileId') fileNumber: string) {
    return await this.publicAppService.getPublicData(fileNumber);
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

  @Get('/notice-of-intent/:fileId')
  async getNoticeOfIntent(@Param('fileId') fileNumber: string) {
    return await this.publicNoticeOfIntentService.getPublicData(fileNumber);
  }

  @Get('/notice-of-intent/:fileId/:uuid/download')
  async getNoticeOfIntentDocumentDownload(
    @Param('fileId') fileId: string,
    @Param('uuid') documentUuid: string,
  ) {
    const url = await this.publicNoticeOfIntentService.getDownloadUrl(
      documentUuid,
    );

    return {
      url,
    };
  }

  @Get('/notice-of-intent/:fileId/:uuid/open')
  async getNoticeOfIntentDocumentOpen(
    @Param('fileId') fileId: string,
    @Param('uuid') documentUuid: string,
  ) {
    const url = await this.publicNoticeOfIntentService.getInlineUrl(
      documentUuid,
    );

    return {
      url,
    };
  }
}
