import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationEditService } from './application-edit.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-edit')
@UseGuards(RolesGuard)
export class ApplicationEditController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationEditService: ApplicationEditService,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getOrCreateDraft(@Param('fileNumber') fileNumber: string) {
    const applicationSubmission =
      await this.applicationEditService.getOrCreateDraft(fileNumber);
    return await this.applicationEditService.mapToDetailedDto(
      applicationSubmission,
    );
  }

  @Delete('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async deleteDraft(@Param('fileNumber') fileNumber: string) {
    await this.applicationEditService.deleteDraft(fileNumber);
  }
}
