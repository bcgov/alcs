import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationDecisionV2Service } from '../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import { ApplicationSubmissionService } from '../../application-submission/application-submission.service';
import { ApplicationPortalDecisionDto } from './application-decision.dto';

@Public()
@Controller('application/decision')
export class ApplicationDecisionController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private decisionService: ApplicationDecisionV2Service,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  async listDecisions(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
  ): Promise<ApplicationPortalDecisionDto[]> {
    const decisions = await this.decisionService.getForPortal(fileNumber);

    return this.mapper.mapArray(
      decisions,
      ApplicationDecision,
      ApplicationPortalDecisionDto,
    );
  }

  @Get('/:uuid/open')
  async openFile(@Param('uuid') fileUuid: string, @Req() req) {
    const url = await this.decisionService.getDownloadUrl(fileUuid);

    //TODO: How do we know which documents applicant can access?

    return { url };
  }
}
