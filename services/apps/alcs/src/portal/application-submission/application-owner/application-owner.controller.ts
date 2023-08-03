import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { ApplicationSubmissionService } from '../application-submission.service';
import {
  APPLICATION_OWNER,
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
  AttachCorporateSummaryDto,
  SetPrimaryContactDto,
} from './application-owner.dto';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

@Controller('application-owner')
@UseGuards(PortalAuthGuard)
export class ApplicationOwnerController {
  constructor(
    private ownerService: ApplicationOwnerService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private documentService: DocumentService,
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
    @Req() req,
  ): Promise<ApplicationOwnerDto[]> {
    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        submissionUuid,
        req.user.entity,
      );

    return this.mapper.mapArrayAsync(
      applicationSubmission.owners,
      ApplicationOwner,
      ApplicationOwnerDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: ApplicationOwnerCreateDto,
    @Req() req,
  ): Promise<ApplicationOwnerDto> {
    this.verifyDto(createDto);

    const application =
      await this.applicationSubmissionService.verifyAccessByUuid(
        createDto.applicationSubmissionUuid,
        req.user.entity,
      );
    const owner = await this.ownerService.create(createDto, application);

    return this.mapper.mapAsync(owner, ApplicationOwner, ApplicationOwnerDto);
  }

  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationOwnerUpdateDto,
    @Req() req,
  ) {
    await this.verifyAccessAndGetOwner(req, uuid);
    this.verifyDto(updateDto);

    const newParcel = await this.ownerService.update(uuid, updateDto);

    return this.mapper.mapAsync(
      newParcel,
      ApplicationOwner,
      ApplicationOwnerDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.verifyAccessAndGetOwner(req, uuid);
    if (owner.corporateSummary) {
      await this.applicationDocumentService.delete(owner.corporateSummary);
    }
    await this.ownerService.delete(owner);
    return { uuid };
  }

  @Post('/:uuid/link/:parcelUuid')
  async linkToParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    await this.verifyAccessAndGetOwner(req, uuid);

    return { uuid: await this.ownerService.attachToParcel(uuid, parcelUuid) };
  }

  @Post('/:uuid/unlink/:parcelUuid')
  async removeFromParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    await this.verifyAccessAndGetOwner(req, uuid);

    return { uuid: await this.ownerService.removeFromParcel(uuid, parcelUuid) };
  }

  private verifyDto(
    dto: ApplicationOwnerUpdateDto | ApplicationOwnerCreateDto,
  ) {
    if (
      dto.typeCode === APPLICATION_OWNER.INDIVIDUAL &&
      (!dto.firstName || !dto.lastName)
    ) {
      throw new BadRequestException(
        'Individuals require both first and last name',
      );
    }

    if (
      dto.typeCode === APPLICATION_OWNER.ORGANIZATION &&
      !dto.organizationName
    ) {
      throw new BadRequestException(
        'Organizations must have an organizationName',
      );
    }
  }

  @Post('setPrimaryContact')
  async setPrimaryContact(@Body() data: SetPrimaryContactDto, @Req() req) {
    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        data.applicationSubmissionUuid,
        req.user.entity,
      );

    //Create Owner
    if (!data.ownerUuid) {
      await this.ownerService.deleteNonParcelOwners(applicationSubmission.uuid);
      const newOwner = await this.ownerService.create(
        {
          email: data.email,
          typeCode: data.type,
          lastName: data.lastName,
          firstName: data.firstName,
          phoneNumber: data.phoneNumber,
          organizationName: data.organization,
          applicationSubmissionUuid: data.applicationSubmissionUuid,
        },
        applicationSubmission,
      );
      await this.ownerService.setPrimaryContact(
        applicationSubmission.uuid,
        newOwner,
      );
    } else if (data.ownerUuid) {
      const primaryContactOwner = await this.ownerService.getOwner(
        data.ownerUuid,
      );

      if (
        primaryContactOwner.type.code === APPLICATION_OWNER.AGENT ||
        primaryContactOwner.type.code === APPLICATION_OWNER.GOVERNMENT
      ) {
        //Update Fields for non parcel owners
        await this.ownerService.update(primaryContactOwner.uuid, {
          email: data.email,
          typeCode: primaryContactOwner.type.code,
          lastName: data.lastName,
          firstName: data.firstName,
          phoneNumber: data.phoneNumber,
          organizationName: data.organization,
        });
      } else {
        //Delete Non parcel owners if we aren't using one
        await this.ownerService.deleteNonParcelOwners(
          applicationSubmission.uuid,
        );
      }

      await this.ownerService.setPrimaryContact(
        applicationSubmission.uuid,
        primaryContactOwner,
      );
    }
  }

  private async verifyAccessAndGetOwner(@Req() req, ownerUuid: string) {
    const owner = await this.ownerService.getOwner(ownerUuid);
    await this.applicationSubmissionService.verifyAccessByUuid(
      owner.applicationSubmissionUuid,
      req.user.entity,
    );

    return owner;
  }

  @Post('attachCorporateSummary')
  async attachCorporateSummary(
    @Req() req,
    @Body() data: AttachCorporateSummaryDto,
  ) {
    await this.applicationSubmissionService.verifyAccessByFileId(
      data.fileNumber,
      req.user.entity,
    );

    const document = await this.documentService.createDocumentRecord({
      ...data,
      uploadedBy: req.user.entity,
      source: DOCUMENT_SOURCE.APPLICANT,
      system: DOCUMENT_SYSTEM.PORTAL,
    });

    const applicationDocument =
      await this.applicationDocumentService.attachExternalDocument(
        data.fileNumber,
        {
          documentUuid: document.uuid,
          type: DOCUMENT_TYPE.CORPORATE_SUMMARY,
        },
        [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.GOVERNMENT,
          VISIBILITY_FLAG.COMMISSIONER,
        ],
      );

    return {
      uuid: applicationDocument.uuid,
    };
  }
}
