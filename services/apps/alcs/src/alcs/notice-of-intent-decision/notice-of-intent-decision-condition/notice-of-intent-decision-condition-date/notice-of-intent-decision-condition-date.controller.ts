import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../../common/authorization/roles';
import { NoticeOfIntentDecisionConditionDateService } from './notice-of-intent-decision-condition-date.service';
import { NoticeOfIntentDecisionConditionDateDto } from './notice-of-intent-decision-condition-date.dto';

@Controller('notice-of-intent-decision-condition/date')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class NoticeOfIntentDecisionConditionDateController {
  constructor(private service: NoticeOfIntentDecisionConditionDateService) {}

  @Get('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetch(@Query('conditionUuid') conditionUuid): Promise<NoticeOfIntentDecisionConditionDateDto[]> {
    return await this.service.fetchByCondition(conditionUuid);
  }

  @Put('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(
    @Query('conditionUuid') conditionUuid,
    @Body() dtos: NoticeOfIntentDecisionConditionDateDto[],
  ): Promise<NoticeOfIntentDecisionConditionDateDto[]> {
    return await this.service.set(conditionUuid, dtos);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async delete(@Param('uuid') uuid: string) {
    return await this.service.delete(uuid);
  }
}
