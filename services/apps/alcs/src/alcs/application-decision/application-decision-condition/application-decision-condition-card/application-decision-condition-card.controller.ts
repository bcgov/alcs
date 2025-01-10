import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../../common/authorization/roles-guard.service';
import { ApplicationDecisionConditionCardService } from './application-decision-condition-card.service';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { UserRoles } from '../../../../common/authorization/roles.decorator';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../../common/authorization/roles';
import {
  ApplicationDecisionConditionCardDto,
  CreateApplicationDecisionConditionCardDto,
  UpdateApplicationDecisionConditionCardDto,
} from './application-decision-condition-card.dto';
import { ApplicationDecisionConditionCard } from './application-decision-condition-card.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision-condition-card')
@UseGuards(RolesGuard)
export class ApplicationDecisionConditionCardController {
  constructor(
    private service: ApplicationDecisionConditionCardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async get(@Param('uuid') uuid: string): Promise<ApplicationDecisionConditionCardDto> {
    const result = await this.service.get(uuid);

    return await this.mapper.map(result, ApplicationDecisionConditionCard, ApplicationDecisionConditionCardDto);
  }

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(@Body() dto: CreateApplicationDecisionConditionCardDto): Promise<ApplicationDecisionConditionCardDto> {
    const result = await this.service.create(dto);

    return await this.mapper.map(result, ApplicationDecisionConditionCard, ApplicationDecisionConditionCardDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateApplicationDecisionConditionCardDto,
  ): Promise<ApplicationDecisionConditionCardDto> {
    const result = await this.service.update(uuid, dto);

    return await this.mapper.map(result, ApplicationDecisionConditionCard, ApplicationDecisionConditionCardDto);
  }
}
