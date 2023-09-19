import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { DocumentService } from '../../../document/document.service';
import { NotificationSubmissionService } from '../../../portal/notification-submission/notification-submission.service';
import { NOTIFICATION_STATUS } from '../notification-submission-status/notification-status.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('notification-submission')
export class NotificationSubmissionController {
  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
    private documentService: DocumentService,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const submission = await this.notificationSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    return await this.notificationSubmissionService.mapToDetailedDTO(
      submission,
      req.user.entity,
    );
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/document/:uuid/open')
  async downloadFile(@Param('uuid') uuid: string) {
    const document = await this.documentService.getDocument(uuid);
    const url = await this.documentService.getDownloadUrl(document, true);
    return { url };
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Patch('/:fileNumber/update-status')
  async updateStatus(
    @Param('fileNumber') fileNumber: string,
    @Body('statusCode') status: string,
    @Req() req,
  ) {
    if (!fileNumber) {
      throw new ServiceValidationException('File number is required');
    }
    await this.notificationSubmissionService.updateStatus(
      fileNumber,
      status as NOTIFICATION_STATUS,
    );
    return this.get(fileNumber, req);
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Patch('/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Body('contactEmail') contactEmail: string,
    @Req() req,
  ) {
    if (!contactEmail.trim()) {
      throw new ServiceValidationException('Email is required');
    }

    const uuid = await this.notificationSubmissionService.getUuid(fileNumber);
    if (uuid) {
      await this.notificationSubmissionService.update(
        uuid,
        {
          contactEmail,
        },
        req.user.entity,
      );
    }

    return this.get(fileNumber, req);
  }
}
