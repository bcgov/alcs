import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.appService.getHealthStatus();
  }
}
