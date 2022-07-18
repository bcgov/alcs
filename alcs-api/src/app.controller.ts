import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.appService.getHealthStatus();
  }

  @Get('admin')
  adminRoute(): string {
    return 'Admin!';
  }
}
