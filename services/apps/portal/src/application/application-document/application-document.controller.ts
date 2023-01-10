import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Body,
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
import { firstValueFrom } from 'rxjs';
import { AlcsDocumentService } from '../../alcs/document-grpc/alcs-document.service';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { ApplicationService } from '../application.service';
import {
  ApplicationDocumentDto,
  AttachExternalDocumentDto,
} from './application-document.dto';
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
    private applicationService: ApplicationService,
    private alcsDocumentService: AlcsDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber/:documentType')
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE,
    @Req() req,
  ): Promise<ApplicationDocumentDto[]> {
    await this.applicationService.verifyAccess(fileNumber, req.user.entity);

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
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    await this.applicationService.verifyAccess(
      document.applicationFileNumber,
      req.user.entity,
    );

    return await this.applicationDocumentService.getInlineUrl(document);
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationDocumentService.get(fileUuid);

    await this.applicationService.verifyAccess(
      document.applicationFileNumber,
      req.user.entity,
    );

    await this.applicationDocumentService.delete(document);
    return {};
  }

  @Post('/application/:uuid/attachExternal')
  async attachExternalDocument(
    @Param('uuid') fileNumber: string,
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    await this.applicationService.verifyAccess(fileNumber, req.user.entity);

    const alcsDocument = await firstValueFrom(
      this.alcsDocumentService.createExternalDocument({
        ...data,
      }),
    );

    const savedDocument = await this.applicationDocumentService.createRecord(
      data.fileName,
      data.fileSize,
      fileNumber,
      alcsDocument.alcsDocumentUuid,
      data.documentType as DOCUMENT_TYPE,
      req.user.entity,
    );

    return this.mapper.map(
      savedDocument,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }
}
