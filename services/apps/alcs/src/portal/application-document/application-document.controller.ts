import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
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
import {
  ApplicationDocumentDto,
  ApplicationDocumentUpdateDto,
} from '../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { DocumentService } from '../../document/document.service';
import { AttachExternalDocumentDto } from '../application-submission/application-parcel/application-parcel-document/application-parcel-document.dto';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';

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

  @Get('/application/:fileNumber/:documentType')
  async listDocumentsByType(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | null,
    @Req() req,
  ): Promise<ApplicationDocumentDto[]> {
    await this.applicationSubmissionService.verifyAccess(
      fileNumber,
      req.user.entity,
    );

    if (documentType !== null && !DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }

    const documents = await this.applicationDocumentService.list(
      fileNumber,
      documentType as DOCUMENT_TYPE,
    );
    return this.mapper.mapArray(
      documents,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/application/:fileNumber')
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | null,
    @Req() req,
  ): Promise<ApplicationDocumentDto[]> {
    await this.applicationSubmissionService.verifyAccess(
      fileNumber,
      req.user.entity,
    );

    const documents =
      await this.applicationDocumentService.getApplicantDocuments(fileNumber);
    return this.mapper.mapArray(
      documents,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    await this.applicationSubmissionService.verifyAccess(
      document.applicationUuid,
      req.user.entity,
    );

    return await this.applicationDocumentService.getInlineUrl(document);
  }

  @Patch('/application/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() body: ApplicationDocumentUpdateDto[],
  ) {
    await this.applicationSubmissionService.verifyAccess(
      fileNumber,
      req.user.entity,
    );

    //Map form file number to uuid
    const applicationUuid = await this.applicationService.getUuid(fileNumber);

    const res = await this.applicationDocumentService.update(
      body,
      applicationUuid,
    );
    return this.mapper.mapArray(
      res,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    await this.applicationSubmissionService.verifyAccess(
      document.applicationUuid,
      req.user.entity,
    );

    //TODO: How do we control who can delete which document types?

    await this.applicationDocumentService.delete(document);
    return {};
  }

  @Post('/application/:uuid/attachExternal')
  async attachExternalDocument(
    @Param('uuid') fileNumber: string,
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    const submission = await this.applicationSubmissionService.verifyAccess(
      fileNumber,
      req.user.entity,
    );

    const document = await this.documentService.createDocumentRecord(data);

    //TODO: Application wont exist!
    const savedDocument =
      await this.applicationDocumentService.attachExternalDocuments(
        submission.fileNumber,
        [
          {
            documentUuid: document.uuid,
            type: data.documentType,
          },
        ],
      );

    return this.mapper.map(
      savedDocument[0],
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }
}
