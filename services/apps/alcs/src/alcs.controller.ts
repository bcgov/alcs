import { EmailTemplateServiceService } from '@app/common/email-template-service/email-template-service.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { AlcsService } from './alcs.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class AlcsController {
  constructor(
    private appService: AlcsService,
    private emailTemplateService: EmailTemplateServiceService,
  ) {}

  @Get(['', 'health'])
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

  @Get('test-email')
  @Public()
  testEmail() {
    const result = this.emailTemplateService.generateEmail('', {});
    return { html: result.html };
  }
}
