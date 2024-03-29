import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
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
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { OWNER_TYPE } from '../../../common/owner-type/owner-type.entity';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission.service';
import {
  AttachCorporateSummaryDto,
  NoticeOfIntentOwnerCreateDto,
  NoticeOfIntentOwnerDto,
  NoticeOfIntentOwnerUpdateDto,
  SetPrimaryContactDto,
} from './notice-of-intent-owner.dto';
import { NoticeOfIntentOwner } from './notice-of-intent-owner.entity';
import { NoticeOfIntentOwnerService } from './notice-of-intent-owner.service';

@Controller('notice-of-intent-owner')
@UseGuards(PortalAuthGuard)
export class NoticeOfIntentOwnerController {
  constructor(
    private ownerService: NoticeOfIntentOwnerService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private documentService: DocumentService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
    @Req() req,
  ): Promise<NoticeOfIntentOwnerDto[]> {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        submissionUuid,
        req.user.entity,
      );

    return this.mapper.mapArrayAsync(
      noticeOfIntentSubmission.owners,
      NoticeOfIntentOwner,
      NoticeOfIntentOwnerDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: NoticeOfIntentOwnerCreateDto,
    @Req() req,
  ): Promise<NoticeOfIntentOwnerDto> {
    this.verifyDto(createDto);

    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        createDto.noticeOfIntentSubmissionUuid,
        req.user.entity,
      );
    const owner = await this.ownerService.create(
      createDto,
      noticeOfIntentSubmission,
      req.user.entity,
    );

    return this.mapper.mapAsync(
      owner,
      NoticeOfIntentOwner,
      NoticeOfIntentOwnerDto,
    );
  }

  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: NoticeOfIntentOwnerUpdateDto,
    @Req() req,
  ) {
    this.verifyDto(updateDto);

    const newParcel = await this.ownerService.update(
      uuid,
      updateDto,
      req.user.entity,
    );

    return this.mapper.mapAsync(
      newParcel,
      NoticeOfIntentOwner,
      NoticeOfIntentOwnerDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.verifyAccessAndGetOwner(req, uuid);
    if (owner.corporateSummary) {
      await this.noticeOfIntentDocumentService.delete(owner.corporateSummary);
    }
    await this.ownerService.delete(owner, req.user.entity);
    return { uuid };
  }

  @Post('/:uuid/link/:parcelUuid')
  async linkToParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    return {
      uuid: await this.ownerService.attachToParcel(
        uuid,
        parcelUuid,
        req.user.entity,
      ),
    };
  }

  @Post('/:uuid/unlink/:parcelUuid')
  async removeFromParcel(
    @Param('uuid') uuid: string,
    @Param('parcelUuid') parcelUuid: string,
    @Req() req,
  ) {
    return {
      uuid: await this.ownerService.removeFromParcel(
        uuid,
        parcelUuid,
        req.user.entity,
      ),
    };
  }

  private verifyDto(
    dto: NoticeOfIntentOwnerUpdateDto | NoticeOfIntentOwnerCreateDto,
  ) {
    if (
      dto.typeCode === OWNER_TYPE.INDIVIDUAL &&
      (!dto.firstName || !dto.lastName)
    ) {
      throw new BadRequestException(
        'Individuals require both first and last name',
      );
    }

    if (dto.typeCode === OWNER_TYPE.ORGANIZATION && !dto.organizationName) {
      throw new BadRequestException(
        'Organizations must have an organizationName',
      );
    }
  }

  @Post('setPrimaryContact')
  async setPrimaryContact(@Body() data: SetPrimaryContactDto, @Req() req) {
    const user = req.user.entity;
    const applicationSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        data.noticeOfIntentSubmissionUuid,
        user,
      );

    //Create Owner
    if (!data.ownerUuid) {
      await this.ownerService.deleteNonParcelOwners(applicationSubmission.uuid);
      const newOwner =
        data.type === OWNER_TYPE.AGENT || data.type == OWNER_TYPE.GOVERNMENT
          ? await this.ownerService.create(
              {
                email: data.email,
                typeCode: data.type,
                lastName: data.lastName,
                firstName: data.firstName,
                phoneNumber: data.phoneNumber,
                organizationName: data.organization,
                noticeOfIntentSubmissionUuid: data.noticeOfIntentSubmissionUuid,
                crownLandOwnerType: data.crownLandOwnerType,
              },
              applicationSubmission,
              req.user.entity,
            )
          : undefined;
      await this.ownerService.setPrimaryContact(
        applicationSubmission.uuid,
        newOwner,
        user,
      );
    } else if (data.ownerUuid) {
      const primaryContactOwner = await this.ownerService.getOwner(
        data.ownerUuid,
      );

      if (
        primaryContactOwner.type.code === OWNER_TYPE.AGENT ||
        primaryContactOwner.type.code === OWNER_TYPE.GOVERNMENT
      ) {
        //Update Fields for non parcel owners
        await this.ownerService.update(
          primaryContactOwner.uuid,
          {
            email: data.email,
            typeCode: primaryContactOwner.type.code,
            lastName: data.lastName,
            firstName: data.firstName,
            phoneNumber: data.phoneNumber,
            organizationName: data.organization,
            crownLandOwnerType: data.crownLandOwnerType,
          },
          user,
        );
      } else {
        //Delete Non parcel owners if we aren't using one
        await this.ownerService.deleteNonParcelOwners(
          applicationSubmission.uuid,
        );
      }

      await this.ownerService.setPrimaryContact(
        applicationSubmission.uuid,
        primaryContactOwner,
        user,
      );
    }
  }

  private async verifyAccessAndGetOwner(@Req() req, ownerUuid: string) {
    const owner = await this.ownerService.getOwner(ownerUuid);
    await this.noticeOfIntentSubmissionService.getByUuid(
      owner.noticeOfIntentSubmissionUuid,
      req.user.entity,
    );

    return owner;
  }

  @Post('attachCorporateSummary')
  async attachCorporateSummary(
    @Req() req,
    @Body() data: AttachCorporateSummaryDto,
  ) {
    await this.noticeOfIntentSubmissionService.getByFileNumber(
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
      await this.noticeOfIntentDocumentService.attachExternalDocument(
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
