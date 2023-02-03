import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../common/authorization/roles';
import { RolesGuard } from '../common/authorization/roles-guard.service';
import { UserRoles } from '../common/authorization/roles.decorator';
import { StatHolidayService } from './stat-holiday.service';

@Controller('stat-holiday')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class StatHolidayController {
  constructor(
    private holidayService: StatHolidayService, // @Inject(CONFIG_TOKEN) private config: config.IConfig,
  ) {}

  @Get('/:pageNumber/:itemsPerPage')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch(
    @Param('pageNumber') pageNumber: number,
    @Param('itemsPerPage') itemsPerPage: number,
    @Query('search') search?: number,
  ) {
    const result = await this.holidayService.fetch(
      pageNumber,
      itemsPerPage,
      search,
    );
    return { data: result[0], total: result[1] };
  }
}
