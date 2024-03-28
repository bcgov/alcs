import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { PlanningReviewTimelineService } from './planning-review-timeline.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('planning-review-timeline')
@UseGuards(RolesGuard)
export class PlanningReviewTimelineController {
  constructor(
    private planningReviewTimelineService: PlanningReviewTimelineService,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetchTimelineEvents(@Param('fileNumber') fileNumber: string) {
    return await this.planningReviewTimelineService.getTimelineEvents(
      fileNumber,
    );
  }
}
