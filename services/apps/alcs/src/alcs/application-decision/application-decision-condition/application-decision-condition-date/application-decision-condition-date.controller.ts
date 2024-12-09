import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../../common/authorization/roles';
import { ApplicationDecisionConditionDateService } from './application-decision-condition-date.service';
import { ApplicationDecisionConditionDateDto } from './application-decision-condition-date.dto';

@Controller('application-decision-condition/date')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationDecisionConditionDateController {
  constructor(private service: ApplicationDecisionConditionDateService) {}

  @Get('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetch(@Query('conditionUuid') conditionUuid): Promise<ApplicationDecisionConditionDateDto[]> {
    return await this.service.fetchByCondition(conditionUuid);
  }

  @Put('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(
    @Query('conditionUuid') conditionUuid,
    @Body() dtos: ApplicationDecisionConditionDateDto[],
  ): Promise<ApplicationDecisionConditionDateDto[]> {
    return await this.service.set(conditionUuid, dtos);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async delete(@Param('uuid') uuid: string) {
    return await this.service.delete(uuid);
  }
}
