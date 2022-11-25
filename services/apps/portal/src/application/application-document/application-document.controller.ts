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
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { ApplicationDocumentDto } from './application-document.dto';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(AuthGuard)
@Controller('application-document')
export class ApplicationDocumentController {
  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('/application/:fileNumber/:documentType')
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: string,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    if (!DOCUMENT_TYPES.includes(documentType as DOCUMENT_TYPE)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }

    const file = await req.file();
    const savedDocument = await this.applicationDocumentService.attachDocument(
      fileNumber,
      file,
      req.user.entity,
      documentType as DOCUMENT_TYPE,
    );
    return this.mapper.map(
      savedDocument,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/application/:fileNumber/:documentType')
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

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const url = await this.applicationDocumentService.getInlineUrl(document);
    return {
      url,
    };
  }

  @Get('/:uuid/download')
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const url = await this.applicationDocumentService.getDownloadUrl(document);
    return {
      url,
    };
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    await this.applicationDocumentService.delete(document);
    return {};
  }
}
