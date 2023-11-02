import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { NoticeOfIntentDecisionV2Service } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentSubmissionService } from '../../notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentPortalDecisionDto } from './notice-of-intent-decision.dto';

@Public()
@Controller('public/notice-of-intent/decision')
export class NoticeOfIntentDecisionController {
  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  async listDecisions(
    @Param('fileNumber') fileNumber: string,
  ): Promise<NoticeOfIntentPortalDecisionDto[]> {
    const decisions = await this.decisionService.getForPortal(fileNumber);

    return this.mapper.mapArray(
      decisions,
      NoticeOfIntentDecision,
      NoticeOfIntentPortalDecisionDto,
    );
  }

  @Get('/:uuid/open')
  async openFile(@Param('uuid') fileUuid: string) {
    const url = await this.decisionService.getDownloadForPortal(fileUuid);

    return { url };
  }
}
