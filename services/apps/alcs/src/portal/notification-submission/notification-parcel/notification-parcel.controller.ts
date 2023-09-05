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
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { DocumentService } from '../../../document/document.service';
import { NotificationSubmissionService } from '../notification-submission.service';
import {
  NotificationParcelCreateDto,
  NotificationParcelDto,
  NotificationParcelUpdateDto,
} from './notification-parcel.dto';
import { NotificationParcel } from './notification-parcel.entity';
import { NotificationParcelService } from './notification-parcel.service';

@Controller('notification-parcel')
@UseGuards(PortalAuthGuard)
export class NotificationParcelController {
  constructor(
    private parcelService: NotificationParcelService,
    private notificationSubmissionService: NotificationSubmissionService,
    @InjectMapper() private mapper: Mapper,
    private documentService: DocumentService,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
  ): Promise<NotificationParcelDto[] | undefined> {
    const parcels = await this.parcelService.fetchByApplicationSubmissionUuid(
      submissionUuid,
    );
    return this.mapper.mapArrayAsync(
      parcels,
      NotificationParcel,
      NotificationParcelDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: NotificationParcelCreateDto,
    @Req() req,
  ): Promise<NotificationParcelDto> {
    const user = req.user.entity;
    const notificationSubmission =
      await this.notificationSubmissionService.getByUuid(
        createDto.notificationSubmissionUuid,
        user,
      );
    const parcel = await this.parcelService.create(notificationSubmission.uuid);

    return this.mapper.mapAsync(
      parcel,
      NotificationParcel,
      NotificationParcelDto,
    );
  }

  @Put('/')
  async update(
    @Body() updateDtos: NotificationParcelUpdateDto[],
    @Req() req,
  ): Promise<NotificationParcelDto[]> {
    const updatedParcels = await this.parcelService.update(updateDtos);

    return this.mapper.mapArrayAsync(
      updatedParcels,
      NotificationParcel,
      NotificationParcelDto,
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
      NotificationParcel,
      NotificationParcelDto,
    );
  }
}
