import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDecisionMakerDto } from './application-decision-maker.dto';
import { ApplicationDecisionMaker } from './application-decision-maker.entity';
import { ApplicationDecisionMakerService } from './application-decision-maker.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision-maker')
export class ApplicationDecisionMakerController {
  constructor(
    private applicationTypeService: ApplicationDecisionMakerService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  @Get()
  async getAll(): Promise<ApplicationDecisionMakerDto[]> {
    const appTypes = await this.applicationTypeService.getAll();
    return this.applicationMapper.mapArray(
      appTypes,
      ApplicationDecisionMaker,
      ApplicationDecisionMakerDto,
    );
  }
}
