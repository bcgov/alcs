import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NotificationSubmissionStatusType } from './notification-status-type.entity';
import {
  NotificationStatusDto,
  NotificationSubmissionToSubmissionStatusDto,
} from './notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from './notification-status.entity';
import { NotificationSubmissionStatusService } from './notification-submission-status.service';

@Controller('notification-submission-status')
@UserRoles(...ANY_AUTH_ROLE)
export class NotificationSubmissionStatusController {
  constructor(
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('')
  async listStatuses() {
    const statuses =
      await this.notificationSubmissionStatusService.listStatuses();

    return this.mapper.mapArrayAsync(
      statuses,
      NotificationSubmissionStatusType,
      NotificationStatusDto,
    );
  }

  @Get('/:fileNumber')
  async getStatusesByFileNumber(@Param('fileNumber') fileNumber) {
    const statuses =
      await this.notificationSubmissionStatusService.getCurrentStatusesByFileNumber(
        fileNumber,
      );

    return this.mapper.mapArrayAsync(
      statuses,
      NotificationSubmissionToSubmissionStatus,
      NotificationSubmissionToSubmissionStatusDto,
    );
  }

  @Get('/current-status/:fileNumber')
  async getCurrentStatusByFileNumber(@Param('fileNumber') fileNumber) {
    const status =
      await this.notificationSubmissionStatusService.getCurrentStatusByFileNumber(
        fileNumber,
      );

    return this.mapper.mapAsync(
      status,
      NotificationSubmissionToSubmissionStatus,
      NotificationSubmissionToSubmissionStatusDto,
    );
  }
}
