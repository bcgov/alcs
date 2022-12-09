import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './common/authorization/auth-guard.service';
import { PortalService } from './portal.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { Public } from 'nest-keycloak-connect';

@Controller()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get()
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.portalService.getHealthStatus();
  }

  @Get('/token')
  @UseGuards(AuthGuard)
  checkTokenValid() {
    return 'Token Valid';
  }
}
