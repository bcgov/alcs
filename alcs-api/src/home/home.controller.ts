import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { ApplicationSubtaskWithApplicationDTO } from '../card/card-subtask/card-subtask.dto';
import { CardSubtask } from '../card/card-subtask/card-subtask.entity';

import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('home')
@UseGuards(RoleGuard)
export class HomeController {
  constructor(
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
    private reconsiderationService: ApplicationReconsiderationService,
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
    const subtaskType = 'GIS';
    const applications =
      await this.applicationService.getAllApplicationsWithIncompleteSubtasks(
        subtaskType,
      );

    const applicationsWithReconsiderations =
      await this.applicationService.getAllApplicationsWithReconsiderationIncompleteSubtasks(
        subtaskType,
      );

    applicationsWithReconsiderations.push(
      ...applications.filter((a) =>
        applicationsWithReconsiderations.some((r) => r.uuid !== a.uuid),
      ),
    );

    const mappedApps = new Map();
    const subtasks: CardSubtask[] = [];
    for (const application of applicationsWithReconsiderations) {
      application.decisionMeetings = [];
      const mappedApp = await this.applicationService.mapToDtos([application]);
      for (const subtask of application.card?.subtasks) {
        mappedApps.set(subtask.uuid, { app: mappedApp[0], recon: null });
        subtasks.push(subtask);
      }
      for (const recon of application.reconsiderations ?? []) {
        const mappedRecon =
          await this.reconsiderationService.mapToDtosWithoutApplication([
            recon,
          ]);
        for (const subtask of recon.card.subtasks) {
          mappedApps.set(subtask.uuid, {
            app: mappedApp[0],
            recon: mappedRecon[0],
          });
          subtasks.push(subtask);
        }
      }
    }
    const mappedTasks = this.mapper.mapArray(
      subtasks,
      CardSubtask,
      ApplicationSubtaskWithApplicationDTO,
    );
    return mappedTasks.map((task) => ({
      ...task,
      application: mappedApps.get(task.uuid)?.app,
      reconsideration: mappedApps.get(task.uuid)?.recon,
    }));
  }
}
