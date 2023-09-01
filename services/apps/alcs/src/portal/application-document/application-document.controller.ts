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
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { DOCUMENT_SYSTEM } from '../../document/document.dto';
import { DocumentService } from '../../document/document.service';
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

    //TODO: How do we know which documents applicant can access?
    // await this.applicationSubmissionService.verifyAccess(
    //   document.applicationUuid,
    //   req.user.entity,
    // );

    const url = await this.applicationDocumentService.getInlineUrl(document);
    return { url };
  }

  @Get('/:uuid/download')
  async download(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    //TODO: How do we know which documents applicant can access?
    // await this.applicationSubmissionService.verifyAccess(
    //   document.applicationUuid,
    //   req.user.entity,
    // );

    const url = await this.applicationDocumentService.getDownloadUrl(document);
    return { url };
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

    //TODO: How do we know which documents applicant can delete?
    // await this.applicationSubmissionService.verifyAccess(
    //   document.applicationUuid,
    //   req.user.entity,
    // );

    await this.applicationDocumentService.delete(document);
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

    const savedDocument =
      await this.applicationDocumentService.attachExternalDocument(
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
