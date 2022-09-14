import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationSubtaskWithApplicationDTO } from '../application/application-subtask/application-subtask.dto';
import { ApplicationSubtask } from '../application/application-subtask/application-subtask.entity';
import { ApplicationSubtaskService } from '../application/application-subtask/application-subtask.service';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('home')
@UseGuards(RoleGuard)
export class HomeController {
  constructor(
    private applicationService: ApplicationService,
    private applicationSubtaskService: ApplicationSubtaskService,
    @InjectMapper() private mapper: Mapper,
  ) {}

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

  @Get('/subtask')
  @UserRoles(...ANY_AUTH_ROLE)
  async getIncompleteSubtasksByType(): Promise<
    ApplicationSubtaskWithApplicationDTO[]
  > {
    const subtaskTypes = 'GIS';
    const subtasks = await this.applicationSubtaskService.listIncompleteByType(
      subtaskTypes,
    );
    const mappedApps = new Map();
    for (const subtask of subtasks) {
      subtask.application.decisionMeetings = [];
      const mappedApp = await this.applicationService.mapToDtos([
        subtask.application,
      ]);
      mappedApps.set(subtask.uuid, mappedApp[0]);
    }
    const mappedTasks = this.mapper.mapArray(
      subtasks,
      ApplicationSubtask,
      ApplicationSubtaskWithApplicationDTO,
    );
    return mappedTasks.map((task) => ({
      ...task,
      application: mappedApps.get(task.uuid),
    }));
  }
}
