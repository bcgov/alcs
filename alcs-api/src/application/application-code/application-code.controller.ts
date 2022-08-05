import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationStatusDto } from '../application-status/application-status.dto';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationMasterCodesDto } from './application-code.dto';
import { ApplicationDecisionMakerDto } from './application-decision-maker/application-decision-maker.dto';
import { ApplicationDecisionMaker } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationTypeDto } from './application-type/application-type.dto';
import { ApplicationType } from './application-type/application-type.entity';
import { ApplicationCodeService } from './application-code.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-code')
export class ApplicationCodeController {
  constructor(
    private codeService: ApplicationCodeService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  @Get()
  async getAll(): Promise<ApplicationMasterCodesDto> {
    const appTypes = await this.codeService.getAllCodes();

    return {
      status: this.applicationMapper.mapArray(
        appTypes.status,
        ApplicationStatus,
        ApplicationStatusDto,
      ),
      type: this.applicationMapper.mapArray(
        appTypes.type,
        ApplicationType,
        ApplicationTypeDto,
      ),
      decisionMaker: this.applicationMapper.mapArray(
        appTypes.decisionMaker,
        ApplicationDecisionMaker,
        ApplicationDecisionMakerDto,
      ),
    };
  }
}
