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
import * as path from 'path';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { ApplicationOwnerService } from '../../../portal/application-submission/application-owner/application-owner.service';
import { ApplicationParcelService } from '../../../portal/application-submission/application-parcel/application-parcel.service';
import {
  ApplicationDocumentCode,
  DOCUMENT_TYPE,
} from './application-document-code.entity';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
} from './application-document.dto';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-document')
export class ApplicationDocumentController {
  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private parcelService: ApplicationParcelService,
    private ownerService: ApplicationOwnerService,
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

    const savedDocument = await this.saveUploadedFile(req, fileNumber);

    const parcelUuid = req.body.parcelUuid?.value as string | undefined;
    if (
      parcelUuid &&
      savedDocument.typeCode === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE
    ) {
      await this.handleCertificateOfTitleUpdates(parcelUuid, savedDocument);
    }

    const ownerUuid = req.body.ownerUuid?.value as string | undefined;
    if (
      ownerUuid &&
      savedDocument.typeCode === DOCUMENT_TYPE.CORPORATE_SUMMARY
    ) {
      await this.handleCorporateSummaryUpdates(ownerUuid, savedDocument);
    }

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

    const parcelUuid = req.body.parcelUuid?.value as string | undefined;
    if (
      parcelUuid &&
      savedDocument.typeCode === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE
    ) {
      await this.handleCertificateOfTitleUpdates(parcelUuid, savedDocument);
    }

    const ownerUuid = req.body.ownerUuid?.value as string | undefined;
    if (
      ownerUuid &&
      savedDocument.typeCode === DOCUMENT_TYPE.CORPORATE_SUMMARY
    ) {
      await this.handleCorporateSummaryUpdates(ownerUuid, savedDocument);
    }

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

  @Get('/application/:fileNumber/:visibilityFlags')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('visibilityFlags') visibilityFlags: string,
  ): Promise<ApplicationDocumentDto[]> {
    const mappedFlags = visibilityFlags.split('') as VISIBILITY_FLAG[];
    const documents = await this.applicationDocumentService.list(
      fileNumber,
      mappedFlags,
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

  @Post('/sort')
  @UserRoles(...ANY_AUTH_ROLE)
  async sortDocuments(
    @Body() data: { uuid: string; order: number }[],
  ): Promise<void> {
    await this.applicationDocumentService.setSorting(data);
  }

  private async handleCertificateOfTitleUpdates(
    parcelUuid: string,
    savedDocument: ApplicationDocument,
  ) {
    const parcel = await this.parcelService.getOneOrFail(parcelUuid);
    if (parcel) {
      if (
        parcel.certificateOfTitleUuid &&
        parcel.certificateOfTitleUuid !== savedDocument.uuid
      ) {
        await this.supersedeDocument(parcel.certificateOfTitleUuid);
      }

      await this.parcelService.setCertificateOfTitle(parcel, savedDocument);
    }
  }

  private async supersedeDocument(documentUuid: string) {
    const document = await this.applicationDocumentService.get(documentUuid);
    const parsedFileName = path.parse(document.document.fileName);
    await this.applicationDocumentService.update({
      uuid: document.uuid,
      fileName: `${parsedFileName.name}_superseded${parsedFileName.ext}`,
      source: document.document.source as DOCUMENT_SOURCE,
      visibilityFlags: [],
      documentType: document.type!.code as DOCUMENT_TYPE,
      user: document.document.uploadedBy!,
    });
  }

  private async handleCorporateSummaryUpdates(
    ownerUuid: string,
    savedDocument: ApplicationDocument,
  ) {
    const owner = await this.ownerService.getOwner(ownerUuid);
    if (owner) {
      if (
        owner.corporateSummaryUuid &&
        owner.corporateSummaryUuid !== savedDocument.uuid
      ) {
        await this.supersedeDocument(owner.corporateSummaryUuid);
      }

      owner.corporateSummary = savedDocument;
      await this.ownerService.save(owner);
    }
  }

  private async saveUploadedFile(req, fileNumber: string) {
    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    return await this.applicationDocumentService.attachDocument({
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
