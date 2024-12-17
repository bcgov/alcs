import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../../common/authorization/roles';
import { NoticeOfIntentDecisionConditionDateService } from './notice-of-intent-decision-condition-date.service';
import {
  CreateNoticeOfIntentDecisionConditionDateDto,
  NoticeOfIntentDecisionConditionDateDto,
} from './notice-of-intent-decision-condition-date.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition-date.entity';

@Controller('notice-of-intent-decision-condition-dates')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class NoticeOfIntentDecisionConditionDateController {
  constructor(
    private service: NoticeOfIntentDecisionConditionDateService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetch(@Query('conditionUuid') conditionUuid): Promise<NoticeOfIntentDecisionConditionDateDto[]> {
    return await this.service.fetchByCondition(conditionUuid);
  }

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: NoticeOfIntentDecisionConditionDateDto,
  ): Promise<NoticeOfIntentDecisionConditionDateDto> {
    return await this.service.update(uuid, dto);
  }

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(@Body() createDto: CreateNoticeOfIntentDecisionConditionDateDto) {
    const newDate = await this.service.create(createDto);

    return this.autoMapper.map(newDate, NoticeOfIntentDecisionConditionDate, NoticeOfIntentDecisionConditionDateDto);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async delete(@Param('uuid') uuid: string) {
    return await this.service.delete(uuid);
  }
}
