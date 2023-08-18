import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDocumentDto } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SYSTEM } from '../../document/document.dto';
import { DocumentService } from '../../document/document.service';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import {
  AttachExternalDocumentDto,
  PortalNoticeOfIntentDocumentUpdateDto,
} from './notice-of-intent-document.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(PortalAuthGuard)
@Controller('notice-of-intent-document')
export class NoticeOfIntentDocumentController {
  constructor(
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentService: NoticeOfIntentService,
    private documentService: DocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/notice-of-intent/:fileNumber')
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | null,
    @Req() req,
  ): Promise<NoticeOfIntentDocumentDto[]> {
    await this.noticeOfIntentSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    const documents = await this.noticeOfIntentDocumentService.list(
      fileNumber,
      [VISIBILITY_FLAG.APPLICANT],
    );
    return this.mapPortalDocuments(documents);
  }

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.noticeOfIntentDocumentService.get(fileUuid);

    //TODO: How do we know which documents applicant can access?
    // await this.applicationSubmissionService.verifyAccess(
    //   document.applicationUuid,
    //   req.user.entity,
    // );

    const url = await this.noticeOfIntentDocumentService.getInlineUrl(document);
    return { url };
  }

  @Patch('/notice-of-intent/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() body: PortalNoticeOfIntentDocumentUpdateDto[],
  ) {
    await this.noticeOfIntentSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    //Map from file number to uuid
    const noticeOfIntentUuid = await this.noticeOfIntentService.getUuid(
      fileNumber,
    );

    const res =
      await this.noticeOfIntentDocumentService.updateDescriptionAndType(
        body,
        noticeOfIntentUuid,
      );
    return this.mapPortalDocuments(res);
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.noticeOfIntentDocumentService.get(fileUuid);

    //TODO: How do we know which documents applicant can delete?
    // await this.applicationSubmissionService.verifyAccess(
    //   document.applicationUuid,
    //   req.user.entity,
    // );

    await this.noticeOfIntentDocumentService.delete(document);
    return {};
  }

  @Post('/delete-files')
  async deleteMany(@Body() fileUuids: string[]) {
    //TODO: How do we know which documents applicant can delete?
    // await this.applicationSubmissionService.verifyAccess(
    //   document.applicationUuid,
    //   req.user.entity,
    // );
    await this.noticeOfIntentDocumentService.deleteMany(fileUuids);
    return {};
  }

  @Post('/notice-of-intent/:uuid/attachExternal')
  async attachExternalDocument(
    @Param('uuid') fileNumber: string,
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    const submission =
      await this.noticeOfIntentSubmissionService.getByFileNumber(
        fileNumber,
        req.user.entity,
      );

    const document = await this.documentService.createDocumentRecord({
      ...data,
      system: DOCUMENT_SYSTEM.PORTAL,
    });

    const savedDocument =
      await this.noticeOfIntentDocumentService.attachExternalDocument(
        submission.fileNumber,
        {
          documentUuid: document.uuid,
          type: data.documentType,
        },
        [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.GOVERNMENT,
          VISIBILITY_FLAG.COMMISSIONER,
        ],
      );

    const mappedDocs = this.mapPortalDocuments([savedDocument]);
    return mappedDocs[0];
  }

  private mapPortalDocuments(documents: NoticeOfIntentDocument[]) {
    const labeledDocuments = documents.map((document) => {
      if (document.type?.portalLabel) {
        document.type.label = document.type.portalLabel;
      }
      return document;
    });
    return this.mapper.mapArray(
      labeledDocuments,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }
}
