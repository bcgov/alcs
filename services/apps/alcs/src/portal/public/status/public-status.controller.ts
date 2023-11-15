import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationSubmissionStatusService } from '../../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../../alcs/application/application-submission-status/submission-status-type.entity';
import { ApplicationStatusDto } from '../../../alcs/application/application-submission-status/submission-status.dto';
import { NotificationSubmissionStatusType } from '../../../alcs/notification/notification-submission-status/notification-status-type.entity';
import { NotificationStatusDto } from '../../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../../../alcs/notification/notification-submission-status/notification-submission-status.service';

const PUBLIC_APP_STATUSES = ['RECA', 'REVA', 'ALCD'];
const PUBLIC_SRW_STATUSES = ['ALCR'];

@Public()
@Controller('/public/status')
export class PublicStatusController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
  ) {}

  @Get('/')
  async getStatuses() {
    const appStatuses =
      await this.applicationSubmissionStatusService.listStatuses();
    const notiStatuses =
      await this.notificationSubmissionStatusService.listStatuses();

    const publicStatuses = appStatuses.filter((status) =>
      PUBLIC_APP_STATUSES.includes(status.code),
    );

    const mappedStatuses = this.mapper.mapArray(
      publicStatuses,
      ApplicationSubmissionStatusType,
      ApplicationStatusDto,
    );

    const publicNotiStatus = notiStatuses.filter((status) =>
      PUBLIC_SRW_STATUSES.includes(status.code),
    );
    const mappedNotiStatuses = this.mapper.mapArray(
      publicNotiStatus,
      NotificationSubmissionStatusType,
      NotificationStatusDto,
    );

    return [...mappedStatuses, ...mappedNotiStatuses];
  }
}
