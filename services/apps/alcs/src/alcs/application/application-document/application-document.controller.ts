import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
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
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import {
  ApplicationDocumentCode,
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from './application-document-code.entity';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
} from './application-document.dto';
import { ApplicationDocument } from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-document')
export class ApplicationDocumentController {
  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async listAll(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationDocumentDto[]> {
    const documents = await this.applicationDocumentService.list(fileNumber);
    return this.mapper.mapArray(
      documents,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Post('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    if (!DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }

    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    const savedDocument = await this.applicationDocumentService.attachDocument({
      fileNumber,
      fileName,
      file,
      user: req.user.entity,
      documentType: documentType as DOCUMENT_TYPE,
      source: documentSource,
      visibilityFlags,
    });
    return this.mapper.map(
      savedDocument,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateDocument(
    @Param('uuid') documentUuid: string,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    if (!DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }

    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    const savedDocument = await this.applicationDocumentService.update({
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
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/application/:fileNumber/reviewDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listReviewDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationDocumentDto[]> {
    const documents = await this.applicationDocumentService.list(fileNumber);
    const reviewDocuments = documents.filter(
      (doc) => doc.document.source === DOCUMENT_SOURCE.LFNG,
    );

    return this.mapper.mapArray(
      reviewDocuments,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/application/:fileNumber/applicantDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationDocumentDto[]> {
    const documents =
      await this.applicationDocumentService.getApplicantDocuments(fileNumber);

    return this.mapper.mapArray(
      documents,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/application/:fileNumber/:documentType')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE,
  ): Promise<ApplicationDocumentDto[]> {
    if (!DOCUMENT_TYPES.includes(documentType)) {
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

  @Get('/types')
  @UserRoles(...ANY_AUTH_ROLE)
  async listTypes() {
    const types = await this.applicationDocumentService.fetchTypes();
    return this.mapper.mapArray(
      types,
      ApplicationDocumentCode,
      ApplicationDocumentTypeDto,
    );
  }

  @Get('/:uuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async open(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const url = await this.applicationDocumentService.getInlineUrl(document);
    return {
      url,
    };
  }

  @Get('/:uuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const url = await this.applicationDocumentService.getDownloadUrl(document);
    return {
      url,
    };
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    await this.applicationDocumentService.delete(document);
    return {};
  }
}
