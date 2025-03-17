import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import { ApplicationDecisionConditionFinancialInstrumentService } from './application-decision-condition-financial-instrument/application-decision-condition-financial-instrument.service';
import {
  ApplicationDecisionConditionFinancialInstrumentDto,
  CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
} from './application-decision-condition-financial-instrument/application-decision-condition-financial-instrument.dto';
import { ApplicationDecisionConditionFinancialInstrument } from './application-decision-condition-financial-instrument/application-decision-condition-financial-instrument.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision-condition')
@UseGuards(RolesGuard)
export class ApplicationDecisionConditionController {
  constructor(
    private conditionService: ApplicationDecisionConditionService,
    private conditionFinancialInstrumentService: ApplicationDecisionConditionFinancialInstrumentService,
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

  @Get('/:uuid/financial-instruments')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllFinancialInstruments(
    @Param('uuid') uuid: string,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto[]> {
    const financialInstruments = await this.conditionFinancialInstrumentService.getAll(uuid);

    return await this.mapper.mapArray(
      financialInstruments,
      ApplicationDecisionConditionFinancialInstrument,
      ApplicationDecisionConditionFinancialInstrumentDto,
    );
  }

  @Get('/:uuid/financial-instruments/:instrumentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async getFinancialInstrumentByUuid(
    @Param('uuid') uuid: string,
    @Param('instrumentUuid') instrumentUuid: string,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const financialInstrument = await this.conditionFinancialInstrumentService.getByUuid(uuid, instrumentUuid);
    return await this.mapper.map(
      financialInstrument,
      ApplicationDecisionConditionFinancialInstrument,
      ApplicationDecisionConditionFinancialInstrumentDto,
    );
  }

  @Post('/:uuid/financial-instruments')
  @UserRoles(...ANY_AUTH_ROLE)
  async createFinancialInstrument(
    @Param('uuid') uuid: string,
    @Body() dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const financialInstrument = await this.conditionFinancialInstrumentService.create(uuid, dto);
    return await this.mapper.map(
      financialInstrument,
      ApplicationDecisionConditionFinancialInstrument,
      ApplicationDecisionConditionFinancialInstrumentDto,
    );
  }

  @Patch('/:uuid/financial-instruments/:instrumentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateFinancialInstrument(
    @Param('uuid') uuid: string,
    @Param('instrumentUuid') instrumentUuid: string,
    @Body() dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const financialInstrument = await this.conditionFinancialInstrumentService.update(uuid, instrumentUuid, dto);
    return await this.mapper.map(
      financialInstrument,
      ApplicationDecisionConditionFinancialInstrument,
      ApplicationDecisionConditionFinancialInstrumentDto,
    );
  }

  @Delete('/:uuid/financial-instruments/:instrumentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async deleteFinancialInstrument(
    @Param('uuid') uuid: string,
    @Param('instrumentUuid') instrumentUuid: string,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const result = await this.conditionFinancialInstrumentService.remove(uuid, instrumentUuid);
    return await this.mapper.map(
      result,
      ApplicationDecisionConditionFinancialInstrument,
      ApplicationDecisionConditionFinancialInstrumentDto,
    );
  }

  @Post('/sort')
  @UserRoles(...ANY_AUTH_ROLE)
  async sortConditions(@Body() data: { uuid: string; order: number }[]): Promise<void> {
    await this.conditionService.setSorting(data);
  }
}
