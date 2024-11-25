import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationDecisionConditionTypeDto } from '../../application-decision/application-decision-condition/application-decision-condition.dto';
import { NoticeofIntentDecisionConditionTypesService } from './notice-of-intent-decision-condition-types.service';

@Controller('noi-decision-condition-types')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class NoticeofIntentDecisionConditionTypesController {
  constructor(private noiDecisionConditionTypesService: NoticeofIntentDecisionConditionTypesService) {}

  @Get()
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch() {
    return await this.noiDecisionConditionTypesService.fetch();
  }

  @Patch('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(@Param('code') code: string, @Body() updateDto: ApplicationDecisionConditionTypeDto) {
    return await this.noiDecisionConditionTypesService.update(code, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: ApplicationDecisionConditionTypeDto) {
    return await this.noiDecisionConditionTypesService.create(createDto);
  }
}