import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AuthGuard } from './common/authorization/auth-guard.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { PortalService } from './portal.service';

@Controller()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('/token')
  @UseGuards(AuthGuard)
  checkTokenValid() {
    return 'Token Valid';
  }

  @Get()
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.portalService.getHealthStatus();
  }
}
