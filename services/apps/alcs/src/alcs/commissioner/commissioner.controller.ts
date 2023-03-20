import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationModificationService } from '../decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../decision/application-reconsideration/application-reconsideration.service';
import { CommissionerApplicationDto } from './commissioner.dto';

@Controller('commissioner')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class CommissionerController {
  constructor(
    private applicationService: ApplicationService,
    private modificationService: ApplicationModificationService,
    private reconsiderationService: ApplicationReconsiderationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(AUTH_ROLE.COMMISSIONER)
  async get(
    @Param('fileNumber') fileNumber,
  ): Promise<CommissionerApplicationDto> {
    const application = await this.applicationService.getOrFail(fileNumber);
    const firstMap = await this.applicationService.mapToDtos([application]);
    const modifications = await this.modificationService.getByApplication(
      application.fileNumber,
    );
    const recons = await this.reconsiderationService.getByApplication(
      application.fileNumber,
    );
    const finalMap = await this.mapper.mapArrayAsync(
      firstMap,
      ApplicationDto,
      CommissionerApplicationDto,
    );
    const hasApprovedOrPendingModification = modifications.reduce(
      (showLabel, modification) => {
        return modification.reviewOutcome.code !== 'REF';
      },
      false,
    );
    const mappedRecords = finalMap[0];
    return {
      ...mappedRecords,
      hasModifications: hasApprovedOrPendingModification,
      hasRecons: recons.length > 0,
    };
  }
}
