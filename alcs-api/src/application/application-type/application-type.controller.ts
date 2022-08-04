import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationTypeDto } from './application-type.dto';
import { ApplicationType } from './application-type.entity';
import { ApplicationTypeService } from './application-type.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-types')
export class ApplicationTypeController {
  constructor(
    private applicationTypeService: ApplicationTypeService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  @Get()
  async getAll(): Promise<ApplicationTypeDto[]> {
    const appTypes = await this.applicationTypeService.getAll();
    return this.applicationMapper.mapArray(
      appTypes,
      ApplicationType,
      ApplicationTypeDto,
    );
  }
}
