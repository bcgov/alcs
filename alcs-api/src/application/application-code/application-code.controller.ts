import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationStatusDto } from '../application-status/application-status.dto';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationMasterCodesDto } from './application-code.dto';
import { ApplicationCodeService } from './application-code.service';
import { ApplicationDecisionMakerDto } from './application-decision-maker/application-decision-maker.dto';
import { ApplicationDecisionMaker } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationRegionDto } from './application-region/application-region.dto';
import { ApplicationRegion } from './application-region/application-region.entity';
import { ApplicationTypeDto } from './application-type/application-type.dto';
import { ApplicationType } from './application-type/application-type.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-code')
@UseGuards(RoleGuard)
export class ApplicationCodeController {
  constructor(
    private codeService: ApplicationCodeService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getAll(): Promise<ApplicationMasterCodesDto> {
    const appTypes = await this.codeService.getAll();

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
      region: this.applicationMapper.mapArray(
        appTypes.region,
        ApplicationRegion,
        ApplicationRegionDto,
      ),
    };
  }
}
