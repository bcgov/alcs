import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { ANY_AUTH_ROLE } from './common/authorization/roles';
import { RolesGuard } from './common/authorization/roles-guard.service';
import { UserRoles } from './common/authorization/roles.decorator';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.appService.getHealthStatus();
  }

  @Get('token')
  @ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
  @UseGuards(RolesGuard)
  @UserRoles(...ANY_AUTH_ROLE)
  adminRoute(): string {
    return 'Admin!';
  }
}
