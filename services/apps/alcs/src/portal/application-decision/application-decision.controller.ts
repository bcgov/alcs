import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDecision } from '../../alcs/decision/application-decision.entity';
import { ApplicationDecisionV2Service } from '../../alcs/decision/decision-v2/application-decision/application-decision-v2.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { PortalDecisionDto } from './application-decision.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(PortalAuthGuard)
@Controller('application-decision')
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
  ): Promise<PortalDecisionDto[]> {
    await this.applicationSubmissionService.verifyAccessByFileId(
      fileNumber,
      req.user.entity,
    );

    const decisions = await this.decisionService.getForPortal(fileNumber);

    return this.mapper.mapArray(
      decisions,
      ApplicationDecision,
      PortalDecisionDto,
    );
  }

  @Get('/:uuid/open')
  async openFile(@Param('uuid') fileUuid: string, @Req() req) {
    const url = await this.decisionService.getDownloadUrl(fileUuid);

    //TODO: How do we know which documents applicant can access?

    return { url };
  }
}
