import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../../document/document-code.entity';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DocumentTypeDto,
} from '../../../document/document.dto';
import { NotificationDocumentDto } from './notification-document.dto';
import {
  NotificationDocument,
  VISIBILITY_FLAG,
} from './notification-document.entity';
import { NotificationDocumentService } from './notification-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('notification-document')
export class NotificationDocumentController {
  constructor(
    private notificationDocumentService: NotificationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/notification/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async listAll(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NotificationDocumentDto[]> {
    const documents = await this.notificationDocumentService.list(fileNumber);
    return this.mapper.mapArray(
      documents,
      NotificationDocument,
      NotificationDocumentDto,
    );
  }

  @Post('/notification/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<NotificationDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const savedDocument = await this.saveUploadedFile(req, fileNumber);

    return this.mapper.map(
      savedDocument,
      NotificationDocument,
      NotificationDocumentDto,
    );
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateDocument(
    @Param('uuid') documentUuid: string,
    @Req() req,
  ): Promise<NotificationDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    const savedDocument = await this.notificationDocumentService.update({
      uuid: documentUuid,
      fileName,
      file,
      documentType: documentType as DOCUMENT_TYPE,
      source: documentSource,
      visibilityFlags,
      user: req.user.entity,
    });

    return this.mapper.map(
      savedDocument,
      NotificationDocument,
      NotificationDocumentDto,
    );
  }

  @Get('/notification/:fileNumber/applicantDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NotificationDocumentDto[]> {
    const documents =
      await this.notificationDocumentService.getApplicantDocuments(fileNumber);

    return this.mapper.mapArray(
      documents,
      NotificationDocument,
      NotificationDocumentDto,
    );
  }

  @Get('/notification/:fileNumber/:visibilityFlags')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('visibilityFlags') visibilityFlags: string,
  ): Promise<NotificationDocumentDto[]> {
    const mappedFlags = visibilityFlags.split('') as VISIBILITY_FLAG[];
    const documents = await this.notificationDocumentService.list(
      fileNumber,
      mappedFlags,
    );
    return this.mapper.mapArray(
      documents,
      NotificationDocument,
      NotificationDocumentDto,
    );
  }

  @Get('/types')
  @UserRoles(...ANY_AUTH_ROLE)
  async listTypes() {
    const types = await this.notificationDocumentService.fetchTypes();
    return this.mapper.mapArray(types, DocumentCode, DocumentTypeDto);
  }

  @Get('/:uuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async open(@Param('uuid') fileUuid: string) {
    const document = await this.notificationDocumentService.get(fileUuid);
    const url = await this.notificationDocumentService.getInlineUrl(document);
    return {
      url,
    };
  }

  @Get('/:uuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.notificationDocumentService.get(fileUuid);
    const url = await this.notificationDocumentService.getDownloadUrl(document);
    return {
      url,
    };
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.notificationDocumentService.get(fileUuid);
    await this.notificationDocumentService.delete(document);
    return {};
  }

  private async saveUploadedFile(req, fileNumber: string) {
    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    return await this.notificationDocumentService.attachDocument({
      fileNumber,
      fileName,
      file,
      user: req.user.entity,
      documentType: documentType as DOCUMENT_TYPE,
      source: documentSource,
      visibilityFlags,
      system: DOCUMENT_SYSTEM.ALCS,
    });
  }
}
