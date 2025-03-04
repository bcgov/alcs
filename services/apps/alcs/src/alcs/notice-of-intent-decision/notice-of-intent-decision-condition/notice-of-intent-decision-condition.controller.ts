import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Get, Param, Patch, Query, UseGuards, Post, Delete } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  NoticeOfIntentDecisionConditionDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from './notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionService } from './notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionConditionFinancialInstrumentService } from './notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.service';
import {
  NoticeOfIntentDecisionConditionFinancialInstrumentDto,
  CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto,
} from './notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.dto';
import { NoticeOfIntentDecisionConditionFinancialInstrument } from './notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent-decision-condition')
@UseGuards(RolesGuard)
export class NoticeOfIntentDecisionConditionController {
  constructor(
    private conditionService: NoticeOfIntentDecisionConditionService,
    private conditionFinancialInstrumentService: NoticeOfIntentDecisionConditionFinancialInstrumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getByTypeCode(@Query('type_code') typeCode: string) {
    return await this.conditionService.getByTypeCode(typeCode);
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(@Param('uuid') uuid: string, @Body() updates: UpdateNoticeOfIntentDecisionConditionDto) {
    const condition = await this.conditionService.getOneOrFail(uuid);

    const updatedCondition = await this.conditionService.update(condition, {
      approvalDependant: updates.approvalDependant,
      securityAmount: updates.securityAmount,
      administrativeFee: updates.administrativeFee,
      description: updates.description,
    });
    return await this.mapper.mapAsync(
      updatedCondition,
      NoticeOfIntentDecisionCondition,
      NoticeOfIntentDecisionConditionDto,
    );
  }

  @Get('/:uuid/financial-instruments')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllFinancialInstruments(
    @Param('uuid') uuid: string,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto[]> {
    const financialInstruments = await this.conditionFinancialInstrumentService.getAll(uuid);

    return await this.mapper.mapArray(
      financialInstruments,
      NoticeOfIntentDecisionConditionFinancialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrumentDto,
    );
  }

  @Get('/:uuid/financial-instruments/:instrumentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async getFinancialInstrumentByUuid(
    @Param('uuid') uuid: string,
    @Param('instrumentUuid') instrumentUuid: string,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const financialInstrument = await this.conditionFinancialInstrumentService.getByUuid(uuid, instrumentUuid);
    return await this.mapper.map(
      financialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrumentDto,
    );
  }

  @Post('/:uuid/financial-instruments')
  @UserRoles(...ANY_AUTH_ROLE)
  async createFinancialInstrument(
    @Param('uuid') uuid: string,
    @Body() dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const financialInstrument = await this.conditionFinancialInstrumentService.create(uuid, dto);
    return await this.mapper.map(
      financialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrumentDto,
    );
  }

  @Patch('/:uuid/financial-instruments/:instrumentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateFinancialInstrument(
    @Param('uuid') uuid: string,
    @Param('instrumentUuid') instrumentUuid: string,
    @Body() dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const financialInstrument = await this.conditionFinancialInstrumentService.update(uuid, instrumentUuid, dto);
    return await this.mapper.map(
      financialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrumentDto,
    );
  }

  @Delete('/:uuid/financial-instruments/:instrumentUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async deleteFinancialInstrument(
    @Param('uuid') uuid: string,
    @Param('instrumentUuid') instrumentUuid: string,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const result = await this.conditionFinancialInstrumentService.remove(uuid, instrumentUuid);
    return await this.mapper.map(
      result,
      NoticeOfIntentDecisionConditionFinancialInstrument,
      NoticeOfIntentDecisionConditionFinancialInstrumentDto,
    );
  }
}
