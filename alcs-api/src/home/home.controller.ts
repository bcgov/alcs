import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('home')
@UseGuards(RoleGuard)
export class HomeController {
  constructor(private applicationService: ApplicationService) {}

  @Get('/assigned')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignedToMe(@Req() req): Promise<ApplicationDto[]> {
    const userId = req.user.entity.uuid;
    if (userId) {
      const applications = await this.applicationService.getAll({
        assigneeUuid: userId,
      });
      return this.applicationService.mapToDtos(applications);
    } else {
      return [];
    }
  }
}
