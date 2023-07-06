import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import {
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

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updates: UpdateApplicationDecisionConditionDto,
  ) {
    const condition = await this.conditionService.getOneOrFail(uuid);

    const updatedCondition = await this.conditionService.update(condition, {
      approvalDependant: updates.approvalDependant,
      securityAmount: updates.securityAmount,
      administrativeFee: updates.administrativeFee,
      description: updates.description,
      completionDate: formatIncomingDate(updates.completionDate),
      supersededDate: formatIncomingDate(updates.supersededDate),
    });
    return await this.mapper.mapAsync(
      updatedCondition,
      ApplicationDecisionCondition,
      ApplicationDecisionConditionDto,
    );
  }
}
