import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { NoticeOfIntentDecisionV2Service } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentPortalDecisionDto } from './notice-of-intent-decision.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(PortalAuthGuard)
@Controller('notice-of-intent-decision')
export class NoticeOfIntentDecisionController {
  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/notice-of-intent/:fileNumber')
  async listDecisions(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<NoticeOfIntentPortalDecisionDto[]> {
    await this.noticeOfIntentSubmissionService.getByFileNumber(
      fileNumber,
      req.user.entity,
    );

    const decisions = await this.decisionService.getForPortal(fileNumber);

    return this.mapper.mapArray(
      decisions,
      NoticeOfIntentDecision,
      NoticeOfIntentPortalDecisionDto,
    );
  }

  @Get('/:uuid/open')
  async openFile(@Param('uuid') fileUuid: string, @Req() req) {
    const url = await this.decisionService.getDownloadUrl(fileUuid);

    //TODO: How do we know which documents applicant can access?

    return { url };
  }
}
