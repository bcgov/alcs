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
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { ApplicationOwnerService } from '../application-owner/application-owner.service';
import { ApplicationSubmissionService } from '../application-submission.service';
import {
  ApplicationParcelCreateDto,
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  AttachCertificateOfTitleDto,
} from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

@Controller('application-parcel')
@UseGuards(PortalAuthGuard)
export class ApplicationParcelController {
  constructor(
    private parcelService: ApplicationParcelService,
    private applicationSubmissionService: ApplicationSubmissionService,
    @InjectMapper() private mapper: Mapper,
    private ownerService: ApplicationOwnerService,
    private documentService: DocumentService,
    private applicationDocumentService: ApplicationDocumentService,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
  ): Promise<ApplicationParcelDto[] | undefined> {
    const parcels = await this.parcelService.fetchByApplicationSubmissionUuid(
      submissionUuid,
    );
    return this.mapper.mapArrayAsync(
      parcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: ApplicationParcelCreateDto,
  ): Promise<ApplicationParcelDto> {
    const application = await this.applicationSubmissionService.getOrFailByUuid(
      createDto.applicationSubmissionUuid,
    );
    const parcel = await this.parcelService.create(
      application.uuid,
      createDto.parcelType,
    );

    try {
      if (createDto.ownerUuid) {
        await this.ownerService.attachToParcel(
          createDto.ownerUuid,
          parcel.uuid,
        );
      }
    } catch (e) {
      await this.delete([parcel.uuid]);
      throw e;
    }

    return this.mapper.mapAsync(
      parcel,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Put('/')
  async update(
    @Body() updateDtos: ApplicationParcelUpdateDto[],
  ): Promise<ApplicationParcelDto[]> {
    const updatedParcels = await this.parcelService.update(updateDtos);

    return this.mapper.mapArrayAsync(
      updatedParcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );
  }

  @Delete()
  async delete(@Body() uuids: string[]) {
    const deletedParcels = await this.parcelService.deleteMany(uuids);
    return this.mapper.mapArrayAsync(
      deletedParcels,
      ApplicationParcel,
      ApplicationParcelDto,
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

    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        parcel.applicationSubmissionUuid,
        req.user.entity,
      );

    const certificateOfTitle =
      await this.applicationDocumentService.attachExternalDocument(
        applicationSubmission!.fileNumber,
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
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }
}
