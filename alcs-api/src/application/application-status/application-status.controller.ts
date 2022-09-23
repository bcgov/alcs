import { Body, Controller, Post } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatusService } from './application-status.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-status')
export class ApplicationStatusController {
  constructor(private applicationStatusService: ApplicationStatusService) {}

  @Post()
  async add(
    @Body() application: ApplicationStatusDto,
  ): Promise<ApplicationStatusDto> {
    const app = await this.applicationStatusService.create(application);
    return {
      code: app.code,
      description: app.description,
      label: app.label,
    };
  }
}
