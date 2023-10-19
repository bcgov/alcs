import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
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
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import {
  DEFAULT_PUBLIC_TYPES,
  DOCUMENT_TYPE,
} from '../../document/document-code.entity';
import { DOCUMENT_SYSTEM } from '../../document/document.dto';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import {
  AttachExternalDocumentDto,
  PortalApplicationDocumentUpdateDto,
} from './application-document.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(PortalAuthGuard)
@Controller('application-document')
export class ApplicationDocumentController {
  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationService: ApplicationService,
    private documentService: DocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | null,
    @Req() req,
  ): Promise<ApplicationDocumentDto[]> {
    await this.applicationSubmissionService.verifyAccessByFileId(
      fileNumber,
      req.user.entity,
    );

    const documents = await this.applicationDocumentService.list(fileNumber, [
      VISIBILITY_FLAG.APPLICANT,
    ]);
    return this.mapPortalDocuments(documents);
  }

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const user = req.user.entity as User;

    const canAccessDocument =
      await this.applicationSubmissionService.canAccessDocument(document, user);

    if (canAccessDocument) {
      const url = await this.applicationDocumentService.getInlineUrl(document);
      return { url };
    }

    throw new NotFoundException('Failed to find document');
  }

  @Get('/:uuid/download')
  async download(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const user = req.user.entity as User;

    const canAccessDocument =
      await this.applicationSubmissionService.canAccessDocument(document, user);

    if (canAccessDocument) {
      const url = await this.applicationDocumentService.getDownloadUrl(
        document,
      );
      return { url };
    }

    throw new NotFoundException('Failed to find document');
  }

  @Patch('/application/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() body: PortalApplicationDocumentUpdateDto[],
  ) {
    await this.applicationSubmissionService.verifyAccessByFileId(
      fileNumber,
      req.user.entity,
    );

    //Map from file number to uuid
    const applicationUuid = await this.applicationService.getUuid(fileNumber);

    const res = await this.applicationDocumentService.updateDescriptionAndType(
      body,
      applicationUuid,
    );
    return this.mapPortalDocuments(res);
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const user = req.user.entity as User;

    const canDeleteDocument =
      await this.applicationSubmissionService.canDeleteDocument(document, user);

    if (canDeleteDocument) {
      await this.applicationDocumentService.delete(document);
    } else {
      throw new ForbiddenException('Not allowed to delete document');
    }

    return {};
  }

  @Post('/application/:uuid/attachExternal')
  async attachExternalDocument(
    @Param('uuid') fileNumber: string,
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    const submission =
      await this.applicationSubmissionService.verifyAccessByFileId(
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
      await this.applicationDocumentService.attachExternalDocument(
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

  private mapPortalDocuments(documents: ApplicationDocument[]) {
    const labeledDocuments = documents.map((document) => {
      if (document.type?.portalLabel) {
        document.type.label = document.type.portalLabel;
      }
      return document;
    });
    return this.mapper.mapArray(
      labeledDocuments,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }
}
