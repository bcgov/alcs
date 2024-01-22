import {
  BadRequestException,
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
import { ApplicationDecisionMakerCodeDto } from '../../application-decision/application-decision-maker/decision-maker.dto';
import { ApplicationDecisionMakerService } from './application-decision-maker.service';

@Controller('decision-maker')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationDecisionMakerController {
  constructor(
    private applicationDecisionMakerService: ApplicationDecisionMakerService,
  ) {}

  @Get()
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch() {
    return await this.applicationDecisionMakerService.fetch();
  }

  @Patch('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(
    @Param('code') code: string,
    @Body() updateDto: ApplicationDecisionMakerCodeDto,
  ) {
    return await this.applicationDecisionMakerService.update(code, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: ApplicationDecisionMakerCodeDto) {
    return await this.applicationDecisionMakerService.create(createDto);
  }
}
