import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { RoleGuard } from './common/authorization/role.guard';
import { UserRoles } from './common/authorization/roles.decorator';
import { AUTH_ROLE } from './common/enum';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import * as config from 'config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
