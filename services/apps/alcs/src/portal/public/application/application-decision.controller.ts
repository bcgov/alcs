import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FastifyReply } from 'fastify';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationDecisionV2Service } from '../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import { ApplicationPortalDecisionDto } from './application-decision.dto';

@Public()
@Controller('public/application/decision')
export class ApplicationDecisionController {
  constructor(
    private decisionService: ApplicationDecisionV2Service,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  async listDecisions(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationPortalDecisionDto[]> {
    const decisions = await this.decisionService.getForPortal(fileNumber);

    return this.mapper.mapArray(
      decisions,
      ApplicationDecision,
      ApplicationPortalDecisionDto,
    );
  }

  @Get('/:uuid/open')
  async openFile(@Param('uuid') fileUuid: string) {
    const url = await this.decisionService.getDownloadForPortal(fileUuid);

    return { url };
  }

  @Get('/:uuid/email')
  async emailFile(@Param('uuid') fileUuid: string, @Res() res: FastifyReply) {
    const url = await this.decisionService.getDownloadForPortal(fileUuid);

    res.status(302);
    res.redirect(url);
  }
}
