import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationSubmissionDraftService } from './application-submission-draft.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-submission-draft')
@UseGuards(RolesGuard)
export class ApplicationSubmissionDraftController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationEditService: ApplicationSubmissionDraftService,
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

  @Post('/:fileNumber/publish')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async publishDraft(@Param('fileNumber') fileNumber: string, @Req() req) {
    await this.applicationEditService.publish(fileNumber, req.user.entity);
  }

  @Delete('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async deleteDraft(@Param('fileNumber') fileNumber: string) {
    await this.applicationEditService.deleteDraft(fileNumber);
  }
}
