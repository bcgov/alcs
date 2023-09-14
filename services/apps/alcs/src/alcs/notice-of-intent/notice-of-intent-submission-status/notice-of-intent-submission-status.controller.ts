import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NoticeOfIntentSubmissionStatusType } from './notice-of-intent-status-type.entity';
import {
  NoticeOfIntentStatusDto,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from './notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status.service';

@Controller('notice-of-intent-submission-status')
@UserRoles(...ANY_AUTH_ROLE)
export class NoticeOfIntentSubmissionStatusController {
  constructor(
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('')
  async listStatuses() {
    const statuses =
      await this.noticeOfIntentSubmissionStatusService.listStatuses();

    return this.mapper.mapArrayAsync(
      statuses,
      NoticeOfIntentSubmissionStatusType,
      NoticeOfIntentStatusDto,
    );
  }

  @Get('/:fileNumber')
  async getStatusesByFileNumber(@Param('fileNumber') fileNumber) {
    const statuses =
      await this.noticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber(
        fileNumber,
      );

    return this.mapper.mapArrayAsync(
      statuses,
      NoticeOfIntentSubmissionToSubmissionStatus,
      NoticeOfIntentSubmissionToSubmissionStatusDto,
    );
  }

  @Get('/current-status/:fileNumber')
  async getCurrentStatusByFileNumber(@Param('fileNumber') fileNumber) {
    const status =
      await this.noticeOfIntentSubmissionStatusService.getCurrentStatusByFileNumber(
        fileNumber,
      );

    return this.mapper.mapAsync(
      status,
      NoticeOfIntentSubmissionToSubmissionStatus,
      NoticeOfIntentSubmissionToSubmissionStatusDto,
    );
  }
}
