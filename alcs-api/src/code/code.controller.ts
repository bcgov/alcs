import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from 'nest-keycloak-connect';
import { ReconsiderationTypeDto } from '../application-reconsideration/applicationReconsideration.dto';
import { ApplicationReconsiderationType } from '../application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CardStatusDto } from '../card/card-status/card-status.dto';
import { CardStatus } from '../card/card-status/card-status.entity';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { MasterCodesDto } from './application-code/application-code.dto';
import { ApplicationRegionDto } from './application-code/application-region/application-region.dto';
import { ApplicationRegion } from './application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from './application-code/application-type/application-type.dto';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { CodeService } from './code.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('code')
@UseGuards(RoleGuard)
export class CodeController {
  constructor(
    private codeService: CodeService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getAll(): Promise<MasterCodesDto> {
    const types = await this.codeService.getAll();

    return {
      status: this.mapper.mapArray(types.status, CardStatus, CardStatusDto),
      type: this.mapper.mapArray(
        types.type,
        ApplicationType,
        ApplicationTypeDto,
      ),
      region: this.mapper.mapArray(
        types.region,
        ApplicationRegion,
        ApplicationRegionDto,
      ),
      reconsiderationType: this.mapper.mapArray(
        types.reconsiderationTypes,
        ApplicationReconsiderationType,
        ReconsiderationTypeDto,
      ),
    };
  }
}
