import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';

import { MaintenanceService } from '../../common/maintenance/maintenance.service';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('maintenance')
@UseGuards(RolesGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get('/banner')
  @UserRoles(...ANY_AUTH_ROLE)
  async getMaintenanceBanner() {
    return this.maintenanceService.getBanner();
  }
}
