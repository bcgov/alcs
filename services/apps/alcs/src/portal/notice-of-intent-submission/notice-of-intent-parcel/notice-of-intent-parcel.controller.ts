import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDocumentDto } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocument } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission.service';
import {
  AttachCertificateOfTitleDto,
  NoticeOfIntentParcelCreateDto,
  NoticeOfIntentParcelDto,
  NoticeOfIntentParcelUpdateDto,
} from './notice-of-intent-parcel.dto';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from './notice-of-intent-parcel.service';

@Controller('notice-of-intent-parcel')
@UseGuards(PortalAuthGuard)
export class NoticeOfIntentParcelController {
  constructor(
    private parcelService: NoticeOfIntentParcelService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    @InjectMapper() private mapper: Mapper,
    private ownerService: NoticeOfIntentOwnerService,
    private documentService: DocumentService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
  ): Promise<NoticeOfIntentParcelDto[] | undefined> {
    const parcels = await this.parcelService.fetchByApplicationSubmissionUuid(
      submissionUuid,
    );
    return this.mapper.mapArrayAsync(
      parcels,
      NoticeOfIntentParcel,
      NoticeOfIntentParcelDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: NoticeOfIntentParcelCreateDto,
    @Req() req,
  ): Promise<NoticeOfIntentParcelDto> {
    const user = req.user.entity;
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        createDto.noticeOfIntentSubmissionUuid,
        user,
      );
    const parcel = await this.parcelService.create(
      noticeOfIntentSubmission.uuid,
    );

    try {
      if (createDto.ownerUuid) {
        await this.ownerService.attachToParcel(
          createDto.ownerUuid,
          parcel.uuid,
          user,
        );
      }
    } catch (e) {
      await this.parcelService.deleteMany([parcel.uuid], user);
      throw e;
    }

    return this.mapper.mapAsync(
      parcel,
      NoticeOfIntentParcel,
      NoticeOfIntentParcelDto,
    );
  }

  @Put('/')
  async update(
    @Body() updateDtos: NoticeOfIntentParcelUpdateDto[],
    @Req() req,
  ): Promise<NoticeOfIntentParcelDto[]> {
    const updatedParcels = await this.parcelService.update(
      updateDtos,
      req.user.entity,
    );

    return this.mapper.mapArrayAsync(
      updatedParcels,
      NoticeOfIntentParcel,
      NoticeOfIntentParcelDto,
    );
  }

  @Delete()
  async delete(@Body() uuids: string[], @Req() req) {
    const deletedParcels = await this.parcelService.deleteMany(
      uuids,
      req.user.entity,
    );
    return this.mapper.mapArrayAsync(
      deletedParcels,
      NoticeOfIntentParcel,
      NoticeOfIntentParcelDto,
    );
  }

  @Post(':uuid/attachCertificateOfTitle')
  async attachCorporateSummary(
    @Req() req,
    @Param('uuid') parcelUuid: string,
    @Body() data: AttachCertificateOfTitleDto,
  ) {
    const parcel = await this.parcelService.getOneOrFail(parcelUuid);
    const document = await this.documentService.createDocumentRecord({
      ...data,
      uploadedBy: req.user.entity,
      source: DOCUMENT_SOURCE.APPLICANT,
      system: DOCUMENT_SYSTEM.PORTAL,
    });

    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        parcel.noticeOfIntentSubmissionUuid,
        req.user.entity,
      );

    const certificateOfTitle =
      await this.noticeOfIntentDocumentService.attachExternalDocument(
        noticeOfIntentSubmission.fileNumber,
        {
          documentUuid: document.uuid,
          type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        },
        [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.GOVERNMENT,
          VISIBILITY_FLAG.COMMISSIONER,
        ],
      );

    await this.parcelService.setCertificateOfTitle(parcel, certificateOfTitle);

    return this.mapper.map(
      certificateOfTitle,
      NoticeOfIntentDocument,
      NoticeOfIntentDocumentDto,
    );
  }
}
