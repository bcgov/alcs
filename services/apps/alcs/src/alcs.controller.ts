import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Public, RoleGuard } from 'nest-keycloak-connect';
import { AlcsService } from './alcs.service';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';

@Controller()
export class AlcsController {
  constructor(private appService: AlcsService) {}

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

  // TODO This is just an example of how to generate pdf using cdogs service.
  // This code will be removed once we have finalized feature
  // @Get('/generate')
  // @Public()
  // async generateDocument(@Res() resp: FastifyReply) {
  //   console.log('here');
  //   const result = await this.documentGeneration.generateDocument(
  //     'demo-app.pdf',
  //     'sources/alcs/templates/demo-app.docx',
  //   );

  //   resp.type('application/pdf');
  //   resp.send(result.data);
  // }

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
