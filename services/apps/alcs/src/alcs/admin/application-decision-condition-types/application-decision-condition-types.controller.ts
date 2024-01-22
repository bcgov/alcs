import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationDecisionConditionTypeDto } from '../../application-decision/application-decision-condition/application-decision-condition.dto';
import { ApplicationDecisionConditionTypesService } from './application-decision-condition-types.service';

@Controller('decision-condition-types')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationDecisionConditionTypesController {
  constructor(
    private applicationDecisionConditionTypesService: ApplicationDecisionConditionTypesService,
  ) {}

  @Get()
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch() {
    return await this.applicationDecisionConditionTypesService.fetch();
  }

  @Patch('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(
    @Param('code') code: string,
    @Body() updateDto: ApplicationDecisionConditionTypeDto,
  ) {
    return await this.applicationDecisionConditionTypesService.update(
      code,
      updateDto,
    );
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: ApplicationDecisionConditionTypeDto) {
    return await this.applicationDecisionConditionTypesService.create(
      createDto,
    );
  }
}
