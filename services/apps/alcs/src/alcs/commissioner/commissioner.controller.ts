import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { TrackingService } from '../../common/tracking/tracking.service';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { CommissionerApplicationDto } from './commissioner.dto';

@Controller('commissioner')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class CommissionerController {
  constructor(
    private applicationService: ApplicationService,
    private modificationService: ApplicationModificationService,
    private reconsiderationService: ApplicationReconsiderationService,
    private trackingService: TrackingService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(AUTH_ROLE.COMMISSIONER)
  async get(
    @Param('fileNumber') fileNumber,
    @Req() req,
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
    await this.trackingService.trackView(req.user.entity, fileNumber);
    return {
      ...mappedRecords,
      hasModifications: hasApprovedOrPendingModification,
      hasRecons: recons.length > 0,
    };
  }
}
