import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ConfigurationService } from './configuration.service';

@Public()
@Controller('/configuration')
export class ConfigurationController {
  constructor(private configurationService: ConfigurationService) {}

  @Get('/maintenance-banner')
  async getMaintenanceBanner() {
    return this.configurationService.getMaintenanceBanner();
  }
}
