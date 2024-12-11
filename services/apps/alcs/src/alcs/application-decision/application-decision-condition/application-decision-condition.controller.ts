import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import {
  ApplicationDecisionConditionComponentDto,
  ApplicationDecisionConditionDto,
  UpdateApplicationDecisionConditionDto,
} from './application-decision-condition.dto';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';
import { ApplicationDecisionConditionService } from './application-decision-condition.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision-condition')
@UseGuards(RolesGuard)
export class ApplicationDecisionConditionController {
  constructor(
    private conditionService: ApplicationDecisionConditionService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getByTypeCode(@Query('type_code') typeCode: string) {
    return await this.conditionService.getByTypeCode(typeCode);
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(@Param('uuid') uuid: string, @Body() updates: UpdateApplicationDecisionConditionDto) {
    const condition = await this.conditionService.getOneOrFail(uuid);

    const updatedCondition = await this.conditionService.update(condition, {
      approvalDependant: updates.approvalDependant,
      securityAmount: updates.securityAmount,
      administrativeFee: updates.administrativeFee,
      description: updates.description,
    });
    return await this.mapper.mapAsync(updatedCondition, ApplicationDecisionCondition, ApplicationDecisionConditionDto);
  }

  @Get('/plan-numbers/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async getPlanNumbers(@Param('uuid') uuid: string) {
    const planNumbers = await this.conditionService.getPlanNumbers(uuid);

    return await this.mapper.mapArrayAsync(
      planNumbers,
      ApplicationDecisionConditionComponentPlanNumber,
      ApplicationDecisionConditionComponentDto,
    );
  }

  @Patch('/plan-numbers/condition/:conditionUuid/component/:componentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateConditionPlanNumbers(
    @Param('conditionUuid') conditionUuid: string,
    @Param('componentUuid') componentUuid: string,
    @Body() planNumbers: string | null,
  ) {
    const planNumber = await this.conditionService.updateConditionPlanNumbers(
      conditionUuid,
      componentUuid,
      planNumbers,
    );

    return await this.mapper.mapAsync(
      planNumber,
      ApplicationDecisionConditionComponentPlanNumber,
      ApplicationDecisionConditionComponentDto,
    );
  }
}
