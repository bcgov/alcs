import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationSubtaskWithApplicationDTO } from '../application/application-subtask/application-subtask.dto';
import { CardSubtask } from '../application/application-subtask/application-subtask.entity';
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
        card: { assigneeUuid: userId },
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
    const applications =
      await this.applicationService.getAllApplicationsWithIncompleteSubtasks(
        subtaskTypes,
      );
    const mappedApps = new Map();
    const subtasks: CardSubtask[] = [];
    for (const application of applications) {
      application.decisionMeetings = [];
      const mappedApp = await this.applicationService.mapToDtos([application]);
      for (const subtask of application.card.subtasks) {
        mappedApps.set(subtask.uuid, mappedApp[0]);
        subtasks.push(subtask);
      }
    }
    const mappedTasks = this.mapper.mapArray(
      subtasks,
      CardSubtask,
      ApplicationSubtaskWithApplicationDTO,
    );
    return mappedTasks.map((task) => ({
      ...task,
      application: mappedApps.get(task.uuid),
    }));
  }
}
