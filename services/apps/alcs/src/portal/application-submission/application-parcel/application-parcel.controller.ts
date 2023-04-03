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
import { DOCUMENT_TYPE } from '../../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
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
    private applicationService: ApplicationSubmissionService,
    @InjectMapper() private mapper: Mapper,
    private ownerService: ApplicationOwnerService,
    private documentService: DocumentService,
    private applicationDocumentService: ApplicationDocumentService,
  ) {}

  @Get('application/:fileId')
  async fetchByFileId(
    @Param('fileId') fileId: string,
  ): Promise<ApplicationParcelDto[] | undefined> {
    const parcels = await this.parcelService.fetchByApplicationFileId(fileId);
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
    const application = await this.applicationService.getOrFail(
      createDto.applicationFileId,
    );
    const parcel = await this.parcelService.create(
      application.fileNumber,
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
    });

    const certificateOfTitle =
      await this.applicationDocumentService.attachExternalDocument(
        parcel.applicationFileNumber,
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
