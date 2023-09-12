import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ROLES_ALLOWED_APPLICATIONS,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { NOTIFICATION_STATUS } from './notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from './notification-submission-status/notification-submission-status.service';
import { UpdateNotificationDto } from './notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('fileNumber') fileNumber: string) {
    const notification = await this.notificationService.getByFileNumber(
      fileNumber,
    );
    const mapped = await this.notificationService.mapToDtos([notification]);
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const notification = await this.notificationService.getByCardUuid(cardUuid);
    const mapped = await this.notificationService.mapToDtos([notification]);
    return mapped[0];
  }

  @Post('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Body() updateDto: UpdateNotificationDto,
    @Param('fileNumber') fileNumber: string,
  ) {
    const updatedNotification = await this.notificationService.update(
      fileNumber,
      updateDto,
    );
    const mapped = await this.notificationService.mapToDtos([
      updatedNotification,
    ]);
    return mapped[0];
  }

  @Post('/:fileNumber/cancel')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async cancel(@Param('fileNumber') fileNumber: string) {
    await this.notificationSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      NOTIFICATION_STATUS.CANCELLED,
    );
  }

  @Post('/:fileNumber/uncancel')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async uncancel(@Param('fileNumber') fileNumber: string) {
    await this.notificationSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      NOTIFICATION_STATUS.CANCELLED,
      null,
    );
  }

  @Get('/search/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntents = await this.notificationService.searchByFileNumber(
      fileNumber,
    );
    return this.notificationService.mapToDtos(noticeOfIntents);
  }
}
