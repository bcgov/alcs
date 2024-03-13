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
import { PlanningReviewDocumentDto } from './planning-review-document.dto';
import {
  PlanningReviewDocument,
  PR_VISIBILITY_FLAG,
} from './planning-review-document.entity';
import { PlanningReviewDocumentService } from './planning-review-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('planning-review-document')
export class PlanningReviewDocumentController {
  constructor(
    private planningReviewDocumentService: PlanningReviewDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/planning-review/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async listAll(
    @Param('fileNumber') fileNumber: string,
  ): Promise<PlanningReviewDocumentDto[]> {
    const documents = await this.planningReviewDocumentService.list(fileNumber);
    return this.mapper.mapArray(
      documents,
      PlanningReviewDocument,
      PlanningReviewDocumentDto,
    );
  }

  @Post('/planning-review/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<PlanningReviewDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const savedDocument = await this.saveUploadedFile(req, fileNumber);

    return this.mapper.map(
      savedDocument,
      PlanningReviewDocument,
      PlanningReviewDocumentDto,
    );
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateDocument(
    @Param('uuid') documentUuid: string,
    @Req() req,
  ): Promise<PlanningReviewDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    const savedDocument = await this.planningReviewDocumentService.update({
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
      PlanningReviewDocument,
      PlanningReviewDocumentDto,
    );
  }

  @Get('/planning-review/:fileNumber/reviewDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listReviewDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<PlanningReviewDocumentDto[]> {
    const documents = await this.planningReviewDocumentService.list(fileNumber);
    const reviewDocuments = documents.filter(
      (doc) => doc.document.source === DOCUMENT_SOURCE.LFNG,
    );

    return this.mapper.mapArray(
      reviewDocuments,
      PlanningReviewDocument,
      PlanningReviewDocumentDto,
    );
  }

  @Get('/planning-review/:fileNumber/:visibilityFlags')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('visibilityFlags') visibilityFlags: string,
  ): Promise<PlanningReviewDocumentDto[]> {
    const mappedFlags = visibilityFlags.split('') as PR_VISIBILITY_FLAG[];
    const documents = await this.planningReviewDocumentService.list(
      fileNumber,
      mappedFlags,
    );
    return this.mapper.mapArray(
      documents,
      PlanningReviewDocument,
      PlanningReviewDocumentDto,
    );
  }

  @Get('/types')
  @UserRoles(...ANY_AUTH_ROLE)
  async listTypes() {
    const types = await this.planningReviewDocumentService.fetchTypes();
    return this.mapper.mapArray(types, DocumentCode, DocumentTypeDto);
  }

  @Get('/:uuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async open(@Param('uuid') fileUuid: string) {
    const document = await this.planningReviewDocumentService.get(fileUuid);
    const url = await this.planningReviewDocumentService.getInlineUrl(document);
    return {
      url,
    };
  }

  @Get('/:uuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.planningReviewDocumentService.get(fileUuid);
    const url =
      await this.planningReviewDocumentService.getDownloadUrl(document);
    return {
      url,
    };
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.planningReviewDocumentService.get(fileUuid);
    await this.planningReviewDocumentService.delete(document);
    return {};
  }

  @Post('/sort')
  @UserRoles(...ANY_AUTH_ROLE)
  async sortDocuments(
    @Body() data: { uuid: string; order: number }[],
  ): Promise<void> {
    await this.planningReviewDocumentService.setSorting(data);
  }

  private async saveUploadedFile(req, fileNumber: string) {
    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    return await this.planningReviewDocumentService.attachDocument({
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
