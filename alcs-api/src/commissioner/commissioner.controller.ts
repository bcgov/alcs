import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { RolesGuard } from '../common/authorization/roles-guard.service';
import { AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CommissionerApplicationDto } from './commissioner.dto';

@Controller('commissioner')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class CommissionerController {
  constructor(
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(AUTH_ROLE.COMMISSIONER)
  async get(
    @Param('fileNumber') fileNumber,
  ): Promise<CommissionerApplicationDto> {
    const application = await this.applicationService.get(fileNumber);
    const firstMap = await this.applicationService.mapToDtos([application]);
    const finalMap = await this.mapper.mapArrayAsync(
      firstMap,
      ApplicationDto,
      CommissionerApplicationDto,
    );
    return finalMap[0];
  }
}
