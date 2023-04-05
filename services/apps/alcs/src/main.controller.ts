import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { MainService } from './main.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class MainController {
  constructor(private appService: MainService) {}

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

  // TODO this is an example of email sending using the mjml template.
  // This code will be removed once we have finalized feature
  // @Public()
  // @Get('test-email')
  // testEmail() {
  //   const template = generateTemplate({
  //     fileNumber: '100095',
  //     applicantName: 'John Smith',
  //     status: 'In Progress',
  //   });

  //   this.emailService.sendEmail({
  //     to: ['mekhti@bit3.ca'],
  //     body: template.html,
  //     subject: 'test',
  //   });

  //   return;
  // }
}
