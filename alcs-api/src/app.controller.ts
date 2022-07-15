import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AUTH_ROLES, RoleGuard } from './common/authorization/role.guard';
import { UserRoles } from './common/authorization/roles.decorator';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHealthStatus(): Promise<HealthCheckDto> {
    return await this.appService.getHealthStatus();
  }

  @Get('admin')
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLES.ADMIN)
  adminRoute(): string {
    return 'Admin!';
  }
}
