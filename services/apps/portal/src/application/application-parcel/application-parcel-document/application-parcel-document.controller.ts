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

import { AlcsDocumentService } from '../../../alcs/document-grpc/alcs-document.service';
import { AuthGuard } from '../../../common/authorization/auth-guard.service';
import { ApplicationDocumentDto } from '../../application-document/application-document.dto';
import { ApplicationService } from '../../application.service';
import { ApplicationParcelService } from '../application-parcel.service';
import {
  ApplicationParcelDocumentDto,
  AttachExternalDocumentDto,
} from './application-parcel-document.dto';
import {
  ApplicationParcelDocument,
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from './application-parcel-document.entity';
import { ApplicationParcelDocumentService } from './application-parcel-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(AuthGuard)
@Controller('application-parcel-document')
export class ApplicationParcelDocumentController {
  constructor(
    private applicationParcelDocumentService: ApplicationParcelDocumentService,
    private alcsDocumentService: AlcsDocumentService,
    private applicationParcelService: ApplicationParcelService,
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber/:documentType')
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE,
    @Req() req,
  ): Promise<ApplicationParcelDocumentDto[]> {
    await this.applicationService.verifyAccess(fileNumber, req.user.entity);

    if (!DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }

    const documents = await this.applicationParcelDocumentService.list(
      fileNumber,
      documentType as DOCUMENT_TYPE,
    );
    return this.mapper.mapArray(
      documents,
      ApplicationParcelDocument,
      ApplicationParcelDocumentDto,
    );
  }

  @Get('/:uuid/open')
  async open(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationParcelDocumentService.get(fileUuid);

    await this.applicationService.verifyAccess(
      document.applicationParcel.applicationFileNumber,
      req.user.entity,
    );

    return await this.applicationParcelDocumentService.getInlineUrl(document);
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') fileUuid: string, @Req() req) {
    const document = await this.applicationParcelDocumentService.get(fileUuid);

    await this.applicationService.verifyAccess(
      document.applicationParcel.applicationFileNumber,
      req.user.entity,
    );

    await this.applicationParcelDocumentService.delete(document);
    return {};
  }

  @Post('/application/:uuid/attachExternal')
  async attachExternalDocument(
    @Param('uuid') parcelUuid: string,
    @Body() data: AttachExternalDocumentDto,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    const parcel = await this.applicationParcelService.getOneOrFail(parcelUuid);
    await this.applicationService.verifyAccess(
      parcel.applicationFileNumber,
      req.user.entity,
    );

    const alcsDocument = await firstValueFrom(
      this.alcsDocumentService.createExternalDocument({
        ...data,
      }),
    );

    const savedDocument =
      await this.applicationParcelDocumentService.createRecord(
        data.fileName,
        data.fileSize,
        parcelUuid,
        alcsDocument.alcsDocumentUuid,
        data.documentType as DOCUMENT_TYPE,
        req.user.entity,
      );

    return this.mapper.map(
      savedDocument,
      ApplicationParcelDocument,
      ApplicationParcelDocumentDto,
    );
  }
}
