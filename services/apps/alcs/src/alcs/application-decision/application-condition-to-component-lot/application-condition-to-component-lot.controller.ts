import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationDecisionConditionToComponentLotDto } from './application-condition-to-component-lot.controller.dto';
import { ApplicationConditionToComponentLotService } from './application-condition-to-component-lot.service';
import { ApplicationDecisionConditionToComponentLot } from './application-decision-condition-to-component-lot.entity';

@Controller('application-condition-to-component-lot')
@UserRoles(...ANY_AUTH_ROLE)
export class ApplicationConditionToComponentLotController {
  constructor(
    private conditionLotService: ApplicationConditionToComponentLotService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Patch('/condition/:conditionUuid/component-lot/:lotUuid')
  async update(
    @Param('conditionUuid') conditionUuid: string,
    @Param('lotUuid') lotUuid: string,
    @Body() planNumbers: string | null,
  ) {
    const updatedLot = await this.conditionLotService.createOrUpdate(
      lotUuid,
      conditionUuid,
      planNumbers,
    );
    return this.mapper.mapAsync(
      updatedLot,
      ApplicationDecisionConditionToComponentLot,
      ApplicationDecisionConditionToComponentLotDto,
    );
  }

  @Get('/component/:componentUuid/condition/:conditionUuid')
  async get(
    @Param('componentUuid') componentUuid: string,
    @Param('conditionUuid') conditionUuid: string,
  ) {
    const updatedLot = await this.conditionLotService.fetch(
      componentUuid,
      conditionUuid,
    );
    return await this.mapper.mapArrayAsync(
      updatedLot,
      ApplicationDecisionConditionToComponentLot,
      ApplicationDecisionConditionToComponentLotDto,
    );
  }
}
