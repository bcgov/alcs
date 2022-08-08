import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import * as config from 'config';
import { AUTH_ROLE } from './common/enum';
import { UserRoles } from './common/authorization/roles.decorator';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.appService.getHealthStatus();
  }

  @Get('admin')
  @ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  adminRoute(): string {
    return 'Admin!';
  }
}
