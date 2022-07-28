import { Controller, Get } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationTypeDto } from './application-type.dto';
import { ApplicationTypeService } from './application-type.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-types')
export class ApplicationTypeController {
  constructor(
    private readonly applicationTypeService: ApplicationTypeService,
  ) {}

  @Get()
  async getAll(): Promise<ApplicationTypeDto[]> {
    const appTypes = await this.applicationTypeService.getAll();
    return appTypes.map<ApplicationTypeDto>((app) => {
      return {
        code: app.code,
        description: app.description,
        label: app.label,
        shortLabel: app.shortLabel,
      };
    });
  }
}
