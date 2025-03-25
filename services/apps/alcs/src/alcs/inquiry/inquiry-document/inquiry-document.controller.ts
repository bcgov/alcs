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
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
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
import { InquiryDocumentDto } from './inquiry-document.dto';
import { InquiryDocument } from './inquiry-document.entity';
import { InquiryDocumentService } from './inquiry-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('inquiry-document')
export class InquiryDocumentController {
  constructor(
    private inquiryDocumentService: InquiryDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/inquiry/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async listAll(
    @Param('fileNumber') fileNumber: string,
  ): Promise<InquiryDocumentDto[]> {
    const documents = await this.inquiryDocumentService.list(fileNumber);
    return this.mapper.mapArray(documents, InquiryDocument, InquiryDocumentDto);
  }

  @Post('/inquiry/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<InquiryDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const savedDocument = await this.saveUploadedFile(req, fileNumber);

    return this.mapper.map(savedDocument, InquiryDocument, InquiryDocumentDto);
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateDocument(
    @Param('uuid') documentUuid: string,
    @Req() req,
  ): Promise<InquiryDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;

    const savedDocument = await this.inquiryDocumentService.update({
      uuid: documentUuid,
      fileName,
      file,
      documentType: documentType as DOCUMENT_TYPE,
      source: documentSource,
      user: req.user.entity,
    });

    return this.mapper.map(savedDocument, InquiryDocument, InquiryDocumentDto);
  }

  @Get('/inquiry/:fileNumber/inquiryDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<InquiryDocumentDto[]> {
    const documents = await this.inquiryDocumentService.list(fileNumber);
    return this.mapper.mapArray(documents, InquiryDocument, InquiryDocumentDto);
  }

  @Get('/types')
  @UserRoles(...ANY_AUTH_ROLE)
  async listTypes() {
    const types = await this.inquiryDocumentService.fetchTypes();
    return this.mapper.mapArray(types, DocumentCode, DocumentTypeDto);
  }

  @Get('/:uuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async open(@Param('uuid') fileUuid: string) {
    const document = await this.inquiryDocumentService.get(fileUuid);
    const url = await this.inquiryDocumentService.getInlineUrl(document);
    return {
      url,
    };
  }

  @Get('/:uuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.inquiryDocumentService.get(fileUuid);
    const url = await this.inquiryDocumentService.getDownloadUrl(document);
    return {
      url,
    };
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.inquiryDocumentService.get(fileUuid);
    await this.inquiryDocumentService.delete(document);
    return {};
  }

  private async saveUploadedFile(req, fileNumber: string) {
    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    let fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;

    fileName = fileName.replace(/[–—]/g, '-'); // Replace en-dash, em-dash with hyphen

    return await this.inquiryDocumentService.attachDocument({
      fileNumber,
      fileName,
      file,
      user: req.user.entity,
      documentType: documentType as DOCUMENT_TYPE,
      source: documentSource,
      system: DOCUMENT_SYSTEM.ALCS,
    });
  }
}
