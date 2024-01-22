import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentSubmissionDraftService } from './notice-of-intent-submission-draft.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent-submission-draft')
@UseGuards(RolesGuard)
export class NoticeOfIntentSubmissionDraftController {
  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentSubmissionDraftService: NoticeOfIntentSubmissionDraftService,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getOrCreateDraft(@Param('fileNumber') fileNumber: string, @Req() req) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionDraftService.getOrCreateDraft(
        fileNumber,
        req.user.entity,
      );
    return await this.noticeOfIntentSubmissionDraftService.mapToDetailedDto(
      noticeOfIntentSubmission,
      req.user.entity,
    );
  }

  @Post('/:fileNumber/publish')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async publishDraft(@Param('fileNumber') fileNumber: string, @Req() req) {
    await this.noticeOfIntentSubmissionDraftService.publish(
      fileNumber,
      req.user.entity,
    );
  }

  @Delete('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async deleteDraft(@Param('fileNumber') fileNumber: string, @Req() req) {
    await this.noticeOfIntentSubmissionDraftService.deleteDraft(
      fileNumber,
      req.user.entity,
    );
  }
}
