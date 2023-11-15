import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
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
import {
  DEFAULT_PUBLIC_TYPES,
  DOCUMENT_TYPE,
} from '../../document/document-code.entity';
import { DOCUMENT_SYSTEM } from '../../document/document.dto';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
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

    const user = req.user.entity as User;

    const canAccessDocument =
      await this.noticeOfIntentSubmissionService.canAccessDocument(
        document,
        user,
      );

    if (canAccessDocument) {
      const url =
        await this.noticeOfIntentDocumentService.getInlineUrl(document);
      return { url };
    }

    throw new NotFoundException('Failed to find document');
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
    const noticeOfIntentUuid =
      await this.noticeOfIntentService.getUuid(fileNumber);

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
    const user = req.user.entity as User;

    const canDeleteDocument =
      await this.noticeOfIntentSubmissionService.canDeleteDocument(
        document,
        user,
      );

    if (canDeleteDocument) {
      await this.noticeOfIntentDocumentService.delete(document);
    } else {
      throw new ForbiddenException('Not allowed to delete document');
    }

    return {};
  }

  @Post('/delete-files')
  async deleteMany(@Body() fileUuids: string[], @Req() req) {
    for (const fileUuid of fileUuids) {
      const document = await this.noticeOfIntentDocumentService.get(fileUuid);
      const user = req.user.entity as User;

      const canDeleteDocument =
        await this.noticeOfIntentSubmissionService.canDeleteDocument(
          document,
          user,
        );

      if (!canDeleteDocument) {
        throw new ForbiddenException('Not allowed to delete document');
      }
    }
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

    const visibilityFlags = [
      VISIBILITY_FLAG.APPLICANT,
      VISIBILITY_FLAG.GOVERNMENT,
      VISIBILITY_FLAG.COMMISSIONER,
    ];

    if (data.documentType && DEFAULT_PUBLIC_TYPES.includes(data.documentType)) {
      visibilityFlags.push(VISIBILITY_FLAG.PUBLIC);
    }

    const savedDocument =
      await this.noticeOfIntentDocumentService.attachExternalDocument(
        submission.fileNumber,
        {
          documentUuid: document.uuid,
          type: data.documentType,
        },
        visibilityFlags,
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
