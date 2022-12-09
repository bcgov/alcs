import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Injectable()
export class PortalService {
  getHello(): string {
    return 'Hello World!';
  }

  async getHealthStatus(): Promise<HealthCheckDto> {
    return {
      alive: true,
    };
  }
}
