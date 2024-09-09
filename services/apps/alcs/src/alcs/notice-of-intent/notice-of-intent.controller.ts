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
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { template } from '../../../../../templates/emails/cancelled/notice-of-intent.template';
import {
  ROLES_ALLOWED_APPLICATIONS,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { TrackingService } from '../../common/tracking/tracking.service';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { BoardService } from '../board/board.service';
import { PARENT_TYPE } from '../card/card-subtask/card-subtask.dto';
import { NOI_SUBMISSION_STATUS } from './notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';
import {
  NoticeOfIntentSubtypeDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent')
@UseGuards(RolesGuard)
export class NoticeOfIntentController {
  constructor(
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private boardService: BoardService,
    private trackingService: TrackingService,
    private statusEmailService: StatusEmailService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const noticeOfIntent =
      await this.noticeOfIntentService.getByFileNumber(fileNumber);
    const mapped = await this.noticeOfIntentService.mapToDtos([noticeOfIntent]);
    await this.trackingService.trackView(req.user.entity, fileNumber);
    return mapped[0];
  }

  @Get('/types')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getSubtypes() {
    const subtypes = await this.noticeOfIntentService.listSubtypes();
    return this.mapper.mapArray(
      subtypes,
      NoticeOfIntentSubtype,
      NoticeOfIntentSubtypeDto,
    );
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const noi = await this.noticeOfIntentService.getByCardUuid(cardUuid);
    const mapped = await this.noticeOfIntentService.mapToDtos([noi]);
    return mapped[0];
  }

  @Post('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Body() updateDto: UpdateNoticeOfIntentDto,
    @Param('fileNumber') fileNumber: string,
  ) {
    const updatedNotice = await this.noticeOfIntentService.update(
      fileNumber,
      updateDto,
    );
    const mapped = await this.noticeOfIntentService.mapToDtos([updatedNotice]);
    return mapped[0];
  }

  @Post('/:fileNumber/cancel')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async cancel(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.get(fileNumber);

    await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      NOI_SUBMISSION_STATUS.CANCELLED,
    );

    const { primaryContact, submissionGovernment } =
      await this.statusEmailService.getNoticeOfIntentEmailData(
        noticeOfIntentSubmission,
      );

    if (
      primaryContact &&
      noticeOfIntentSubmission.status.statusTypeCode !==
        NOI_SUBMISSION_STATUS.IN_PROGRESS
    ) {
      await this.statusEmailService.sendNoticeOfIntentStatusEmail({
        template,
        status: NOI_SUBMISSION_STATUS.CANCELLED,
        noticeOfIntentSubmission,
        government: submissionGovernment,
        parentType: PARENT_TYPE.NOTICE_OF_INTENT,
        primaryContact,
        ccGovernment: !!submissionGovernment,
        ccEmails: [],
      });
    }
  }

  @Post('/:fileNumber/uncancel')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async uncancel(@Param('fileNumber') fileNumber: string) {
    await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      NOI_SUBMISSION_STATUS.CANCELLED,
      null,
    );
  }

  @Get('/search/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntents =
      await this.noticeOfIntentService.searchByFileNumber(fileNumber);
    return this.noticeOfIntentService.mapToDtos(noticeOfIntents);
  }
}
