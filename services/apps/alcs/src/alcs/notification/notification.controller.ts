import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import {
  ROLES_ALLOWED_APPLICATIONS,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { TrackingService } from '../../common/tracking/tracking.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { NotificationSubmissionService } from '../../portal/notification-submission/notification-submission.service';
import { NotificationDocumentService } from './notification-document/notification-document.service';
import { NOTIFICATION_STATUS } from './notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from './notification-submission-status/notification-submission-status.service';
import { UpdateNotificationDto } from './notification.dto';
import { NotificationService } from './notification.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notification')
@UseGuards(RolesGuard)
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationDocumentService: NotificationDocumentService,
    private trackingService: TrackingService,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const notification =
      await this.notificationService.getByFileNumber(fileNumber);
    const mapped = await this.notificationService.mapToDtos([notification]);
    await this.trackingService.trackView(req.user.entity, fileNumber);
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
    @Req() req,
  ) {
    const updatedNotification = await this.notificationService.update(
      fileNumber,
      updateDto,
    );
    const mapped = await this.notificationService.mapToDtos([
      updatedNotification,
    ]);

    if (updateDto.localGovernmentUuid) {
      const uuid = await this.notificationSubmissionService.getUuid(fileNumber);
      if (uuid) {
        await this.notificationSubmissionService.update(
          uuid,
          {
            localGovernmentUuid: updateDto.localGovernmentUuid,
          },
          req.user.entity,
        );
      }
    }

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

  @Post('/:fileNumber/resend')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async resendResponse(@Param('fileNumber') fileNumber: string, @Req() req) {
    const user = req.user.entity;
    const submission = await this.notificationSubmissionService.getByFileNumber(
      fileNumber,
      user,
    );

    const documents = await this.notificationDocumentService.list(fileNumber);
    const document = documents.find(
      (document) => document.type?.code === DOCUMENT_TYPE.LTSA_LETTER,
    );

    if (document) {
      await this.notificationSubmissionService.sendAndRecordLTSAPackage(
        submission,
        document,
        user,
      );
    } else {
      throw new ServiceNotFoundException(
        `Failed to find LTSA Letter on File Number ${fileNumber}`,
      );
    }

    return this.get(fileNumber, req.user.entity);
  }

  @Get('/search/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntents =
      await this.notificationService.searchByFileNumber(fileNumber);
    return this.notificationService.mapToDtos(noticeOfIntents);
  }
}
