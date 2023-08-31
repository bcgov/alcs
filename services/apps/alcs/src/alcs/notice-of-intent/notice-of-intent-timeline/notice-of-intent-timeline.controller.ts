import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NoticeOfIntentTimelineService } from './notice-of-intent-timeline.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent-timeline')
@UseGuards(RolesGuard)
export class NoticeOfIntentTimelineController {
  constructor(private noiTimelineService: NoticeOfIntentTimelineService) {}

  @Get('/:fileNumber')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetchTimelineEvents(@Param('fileNumber') fileNumber: string) {
    debugger;
    return await this.noiTimelineService.getTimelineEvents(fileNumber);
  }
}
