import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationReconsiderationDto } from '../application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { HomepageSubtaskDTO } from '../card/card-subtask/card-subtask.dto';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { PlanningReviewDto } from '../planning-review/planning-review.dto';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { AssigneeDto } from '../user/user.dto';
import { User } from '../user/user.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('home')
@UseGuards(RoleGuard)
export class HomeController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private timeService: ApplicationTimeTrackingService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReviewService: PlanningReviewService,
  ) {}

  @Get('/assigned')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignedToMe(@Req() req): Promise<{
    applications: ApplicationDto[];
    reconsiderations: ApplicationReconsiderationDto[];
    planningReviews: PlanningReviewDto[];
  }> {
    const userId = req.user.entity.uuid;
    if (userId) {
      const applications = await this.applicationService.getAll({
        card: { assigneeUuid: userId },
      });
      const reconsiderations = await this.reconsiderationService.getBy({
        card: { assigneeUuid: userId },
      });

      const planningReviews = await this.planningReviewService.getBy({
        card: { assigneeUuid: userId },
      });

      return {
        applications: await this.applicationService.mapToDtos(applications),
        reconsiderations: await this.reconsiderationService.mapToDtos(
          reconsiderations,
        ),
        planningReviews: await this.planningReviewService.mapToDtos(
          planningReviews,
        ),
      };
    } else {
      return {
        applications: [],
        reconsiderations: [],
        planningReviews: [],
      };
    }
  }

  @Get('/subtask')
  @UserRoles(...ANY_AUTH_ROLE)
  async getIncompleteSubtasksByType(): Promise<HomepageSubtaskDTO[]> {
    const subtaskType = 'GIS';

    const applicationsWithSubtasks =
      await this.applicationService.getWithIncompleteSubtaskByType(subtaskType);
    const applicationSubtasks = await this.mapApplicationsToDtos(
      applicationsWithSubtasks,
    );

    const reconsiderationWithSubtasks =
      await this.reconsiderationService.getWithIncompleteSubtaskByType(
        subtaskType,
      );
    const reconSubtasks = this.mapReconToDto(reconsiderationWithSubtasks);

    const planningReviewsWithSubtasks =
      await this.planningReviewService.getWithIncompleteSubtaskByType(
        subtaskType,
      );
    const planningReviewSubtasks = this.mapPlanningReviewsToDTOs(
      planningReviewsWithSubtasks,
    );

    return [
      ...applicationSubtasks,
      ...reconSubtasks,
      ...planningReviewSubtasks,
    ];
  }

  private mapReconToDto(recons: ApplicationReconsideration[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const recon of recons) {
      for (const subtask of recon.card.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(recon.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          paused: false,
          title: `${recon.application.fileNumber} (${recon.application.applicant})`,
        });
      }
    }
    return result;
  }

  private async mapApplicationsToDtos(applications: Application[]) {
    const applicationTimes = await this.timeService.fetchActiveTimes(
      applications,
    );

    const appPausedMap = await this.timeService.getPausedStatus(applications);
    const result: HomepageSubtaskDTO[] = [];
    for (const application of applications) {
      application.decisionMeetings = [];
      for (const subtask of application.card?.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(application.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          activeDays: applicationTimes.get(application.uuid)?.activeDays || 0,
          paused: appPausedMap.get(application.uuid) || false,
          title: `${application.fileNumber} (${application.applicant})`,
        });
      }
    }
    return result;
  }

  private mapPlanningReviewsToDTOs(planingReviews: PlanningReview[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const planningReview of planingReviews) {
      for (const subtask of planningReview.card.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(planningReview.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          paused: false,
          title: `${planningReview.fileNumber} (${planningReview.type})`,
        });
      }
    }
    return result;
  }
}
