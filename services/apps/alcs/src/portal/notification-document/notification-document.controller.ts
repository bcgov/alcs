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
import { NotificationDocumentDto } from '../../alcs/notification/notification-document/notification-document.dto';
import {
  NotificationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { NotificationService } from '../../alcs/notification/notification.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import {
  DEFAULT_PUBLIC_TYPES,
  DOCUMENT_TYPE,
} from '../../document/document-code.entity';
import { DOCUMENT_SYSTEM } from '../../document/document.dto';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { NotificationSubmissionService } from '../notification-submission/notification-submission.service';
import {
  AttachExternalDocumentDto,
  PortalNotificationDocumentUpdateDto,
} from './notification-document.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(PortalAuthGuard)
@Controller('notification-document')
export class NotificationDocumentController {
  constructor(
    private notificationDocumentService: NotificationDocumentService,
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationService: NotificationService,
    private documentService: DocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/notification/:fileNumber')
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | null,
    @Req() req,
  ): Promise<NotificationDocumentDto[]> {
    await this.notificationSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    const documents = await this.notificationDocumentService.list(fileNumber, [
      VISIBILITY_FLAG.APPLICANT,
    ]);
    return this.mapPortalDocuments(documents);
  }

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.notificationDocumentService.get(fileUuid);
    const user = req.user.entity as User;

    const canAccessDocument =
      await this.notificationSubmissionService.canAccessDocument(
        document,
        user,
      );

    if (canAccessDocument) {
      const url = await this.notificationDocumentService.getInlineUrl(document);
      return { url };
    }

    throw new NotFoundException('Failed to find document');
  }

  @Get('/:uuid/download')
  async download(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.notificationDocumentService.get(fileUuid);
    const user = req.user.entity as User;

    const canAccessDocument =
      await this.notificationSubmissionService.canAccessDocument(
        document,
        user,
      );

    if (canAccessDocument) {
      const url =
        await this.notificationDocumentService.getDownloadUrl(document);
      return { url };
    }

    throw new NotFoundException('Failed to find document');
  }

  @Patch('/notification/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() body: PortalNotificationDocumentUpdateDto[],
  ) {
    await this.notificationSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    //Map from file number to uuid
    const notificationUuid = await this.notificationService.getUuid(fileNumber);

    const res = await this.notificationDocumentService.updateDescriptionAndType(
      body,
      notificationUuid,
    );
    return this.mapPortalDocuments(res);
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.notificationDocumentService.get(fileUuid);
    const user = req.user.entity as User;

    const canDeleteDocument =
      await this.notificationSubmissionService.canDeleteDocument(
        document,
        user,
      );

    if (canDeleteDocument) {
      await this.notificationDocumentService.delete(document);
    } else {
      throw new ForbiddenException('Not allowed to delete document');
    }

    return {};
  }

  @Post('/notification/:uuid/attachExternal')
  async attachExternalDocument(
    @Param('uuid') fileNumber: string,
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ): Promise<NotificationDocumentDto> {
    const submission = await this.notificationSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    const document = await this.documentService.createDocumentRecord({
      ...data,
      system: DOCUMENT_SYSTEM.PORTAL,
    });

    const visibilityFlags = [
      VISIBILITY_FLAG.APPLICANT,
      VISIBILITY_FLAG.COMMISSIONER,
    ];

    if (data.documentType && DEFAULT_PUBLIC_TYPES.includes(data.documentType)) {
      visibilityFlags.push(VISIBILITY_FLAG.PUBLIC);
    }

    const savedDocument =
      await this.notificationDocumentService.attachExternalDocument(
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

  private mapPortalDocuments(documents: NotificationDocument[]) {
    const labeledDocuments = documents.map((document) => {
      if (document.type?.portalLabel) {
        document.type.label = document.type.portalLabel;
      }
      return document;
    });
    return this.mapper.mapArray(
      labeledDocuments,
      NotificationDocument,
      NotificationDocumentDto,
    );
  }
}
