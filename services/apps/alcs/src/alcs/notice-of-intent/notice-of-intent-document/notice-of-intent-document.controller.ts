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
import * as path from 'path';
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
import { NoticeOfIntentDocumentDto } from './notice-of-intent-document.dto';
import {
  NoticeOfIntentDocument,
  VISIBILITY_FLAG,
} from './notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('notice-of-intent-document')
export class NoticeOfIntentDocumentController {
  constructor(
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/noi/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async listAll(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NoticeOfIntentDocumentDto[]> {
    const documents = await this.noticeOfIntentDocumentService.list(fileNumber);
    return this.mapper.mapArray(
      documents,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }

  @Post('/noi/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<NoticeOfIntentDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const savedDocument = await this.saveUploadedFile(req, fileNumber);

    //TODO: Re-enable as part of creating Step 1
    // const parcelUuid = req.body.parcelUuid?.value as string | undefined;
    // if (
    //   parcelUuid &&
    //   savedDocument.typeCode === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE
    // ) {
    //   await this.handleCertificateOfTitleUpdates(parcelUuid, savedDocument);
    // }
    //
    // const ownerUuid = req.body.ownerUuid?.value as string | undefined;
    // if (
    //   ownerUuid &&
    //   savedDocument.typeCode === DOCUMENT_TYPE.CORPORATE_SUMMARY
    // ) {
    //   await this.handleCorporateSummaryUpdates(ownerUuid, savedDocument);
    // }

    return this.mapper.map(
      savedDocument,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateDocument(
    @Param('uuid') documentUuid: string,
    @Req() req,
  ): Promise<NoticeOfIntentDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    const savedDocument = await this.noticeOfIntentDocumentService.update({
      uuid: documentUuid,
      fileName,
      file,
      documentType: documentType as DOCUMENT_TYPE,
      source: documentSource,
      visibilityFlags,
      user: req.user.entity,
    });

    //TODO: Re-enable as part of creating Step 1
    // const parcelUuid = req.body.parcelUuid?.value as string | undefined;
    // if (
    //   parcelUuid &&
    //   savedDocument.typeCode === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE
    // ) {
    //   await this.handleCertificateOfTitleUpdates(parcelUuid, savedDocument);
    // }
    //
    // const ownerUuid = req.body.ownerUuid?.value as string | undefined;
    // if (
    //   ownerUuid &&
    //   savedDocument.typeCode === DOCUMENT_TYPE.CORPORATE_SUMMARY
    // ) {
    //   await this.handleCorporateSummaryUpdates(ownerUuid, savedDocument);
    // }

    return this.mapper.map(
      savedDocument,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }

  @Get('/noi/:fileNumber/reviewDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listReviewDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NoticeOfIntentDocumentDto[]> {
    const documents = await this.noticeOfIntentDocumentService.list(fileNumber);
    const reviewDocuments = documents.filter(
      (doc) => doc.document.source === DOCUMENT_SOURCE.LFNG,
    );

    return this.mapper.mapArray(
      reviewDocuments,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }

  @Get('/noi/:fileNumber/applicantDocuments')
  @UserRoles(...ANY_AUTH_ROLE)
  async listApplicantDocuments(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NoticeOfIntentDocumentDto[]> {
    const documents =
      await this.noticeOfIntentDocumentService.getApplicantDocuments(
        fileNumber,
      );

    return this.mapper.mapArray(
      documents,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }

  @Get('/noi/:fileNumber/:visibilityFlags')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('visibilityFlags') visibilityFlags: string,
  ): Promise<NoticeOfIntentDocumentDto[]> {
    const mappedFlags = visibilityFlags.split('') as VISIBILITY_FLAG[];
    const documents = await this.noticeOfIntentDocumentService.list(
      fileNumber,
      mappedFlags,
    );
    return this.mapper.mapArray(
      documents,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }

  @Get('/types')
  @UserRoles(...ANY_AUTH_ROLE)
  async listTypes() {
    const types = await this.noticeOfIntentDocumentService.fetchTypes();
    return this.mapper.mapArray(types, DocumentCode, DocumentTypeDto);
  }

  @Get('/:uuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async open(@Param('uuid') fileUuid: string) {
    const document = await this.noticeOfIntentDocumentService.get(fileUuid);
    const url = await this.noticeOfIntentDocumentService.getInlineUrl(document);
    return {
      url,
    };
  }

  @Get('/:uuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.noticeOfIntentDocumentService.get(fileUuid);
    const url = await this.noticeOfIntentDocumentService.getDownloadUrl(
      document,
    );
    return {
      url,
    };
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.noticeOfIntentDocumentService.get(fileUuid);
    await this.noticeOfIntentDocumentService.delete(document);
    return {};
  }

  //TODO: Re-enable as part of creating Step 1
  //
  // private async handleCertificateOfTitleUpdates(
  //   parcelUuid: string,
  //   savedDocument: NoticeOfIntentDocument,
  // ) {
  //   const parcel = await this.parcelService.getOneOrFail(parcelUuid);
  //   if (parcel) {
  //     if (
  //       parcel.certificateOfTitleUuid &&
  //       parcel.certificateOfTitleUuid !== savedDocument.uuid
  //     ) {
  //       await this.supersedeDocument(parcel.certificateOfTitleUuid);
  //     }
  //
  //     await this.parcelService.setCertificateOfTitle(parcel, savedDocument);
  //   }
  // }

  //
  // private async handleCorporateSummaryUpdates(
  //   ownerUuid: string,
  //   savedDocument: NoticeOfIntentDocument,
  // ) {
  //   const owner = await this.ownerService.getOwner(ownerUuid);
  //   if (owner) {
  //     if (
  //       owner.corporateSummaryUuid &&
  //       owner.corporateSummaryUuid !== savedDocument.uuid
  //     ) {
  //       await this.supersedeDocument(owner.corporateSummaryUuid);
  //     }
  //
  //     owner.corporateSummary = savedDocument;
  //     await this.ownerService.save(owner);
  //   }
  // }

  private async supersedeDocument(documentUuid: string) {
    const document = await this.noticeOfIntentDocumentService.get(documentUuid);
    const parsedFileName = path.parse(document.document.fileName);
    await this.noticeOfIntentDocumentService.update({
      uuid: document.uuid,
      fileName: `${parsedFileName.name}_superseded${parsedFileName.ext}`,
      source: document.document.source as DOCUMENT_SOURCE,
      visibilityFlags: [],
      documentType: document.type!.code as DOCUMENT_TYPE,
      user: document.document.uploadedBy!,
    });
  }

  private async saveUploadedFile(req, fileNumber: string) {
    const documentType = req.body.documentType.value as DOCUMENT_TYPE;
    const file = req.body.file;
    const fileName = req.body.fileName.value as string;
    const documentSource = req.body.source.value as DOCUMENT_SOURCE;
    const visibilityFlags = req.body.visibilityFlags.value.split(', ');

    return await this.noticeOfIntentDocumentService.attachDocument({
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
