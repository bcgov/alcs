import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { AppService } from './app.service';
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
  //One place this should be RoleGuard as this is used by users without any roles
  @UseGuards(RoleGuard)
  adminRoute(): string {
    return 'Admin!';
  }
}
