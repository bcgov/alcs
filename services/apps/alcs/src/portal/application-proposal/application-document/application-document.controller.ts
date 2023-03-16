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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDocumentUpdateDto } from '../../../../../portal/src/application-proposal/application-document/application-document.dto';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from '../../../alcs/application/application-document/application-document.entity';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { DocumentService } from '../../../document/document.service';
import { ApplicationProposalService } from '../application-proposal.service';

import { ApplicationDocumentService } from './application-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(PortalAuthGuard)
@Controller('application-document')
export class ApplicationDocumentController {
  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private applicationService: ApplicationProposalService,
    private documentService: DocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber/:documentType')
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE | null,
    @Req() req,
  ): Promise<ApplicationDocumentDto[]> {
    await this.applicationService.verifyAccess(fileNumber, req.user.entity);

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

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    await this.applicationService.verifyAccess(
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
    await this.applicationService.verifyAccess(fileNumber, req.user.entity);
    const res = await this.applicationDocumentService.update(body, fileNumber);
    return this.mapper.mapArray(
      res,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    await this.applicationService.verifyAccess(
      document.applicationUuid,
      req.user.entity,
    );

    //TODO: How do we control who can delete which document types?

    await this.applicationDocumentService.delete(document);
    return {};
  }
}
