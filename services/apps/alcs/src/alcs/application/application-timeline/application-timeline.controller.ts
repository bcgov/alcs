import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import {
  AUTH_ROLE,
  ROLES_ALLOWED_APPLICATIONS,
} from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationTimelineService } from './application-timeline.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-timeline')
@UseGuards(RolesGuard)
export class ApplicationTimelineController {
  constructor(private applicationTimelineService: ApplicationTimelineService) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetchTimelineEvents(@Param('fileNumber') fileNumber: string) {
    return await this.applicationTimelineService.getTimelineEvents(fileNumber);
  }
}
