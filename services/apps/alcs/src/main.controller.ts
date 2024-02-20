import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { MainService } from './main.service';

// /portal/ routes are used by Portal to check maintenance mode
@Controller()
export class MainController {
  constructor(private appService: MainService) {}

  @Get(['', 'health', '/portal/health'])
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.appService.getHealthStatus();
  }

  @Get(['token', '/portal/token'])
  @ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
  // The one place RoleGuard is used to handle users without roles
  @UseGuards(RoleGuard)
  adminRoute(): string {
    return 'Admin!';
  }
}
