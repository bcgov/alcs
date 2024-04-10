import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { MaintenanceService } from '../../common/maintenance/maintenance.service';

@Public()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get('/banner')
  async getMaintenanceBanner() {
    return this.maintenanceService.getBanner();
  }
}
