import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { MainService } from './main.service';

@Controller()
export class MainController {
  private logger = new Logger(MainController.name);

  constructor(private appService: MainService) {}

  @Get(['', 'health'])
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    this.logger.debug('Test of logger debug message');
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
