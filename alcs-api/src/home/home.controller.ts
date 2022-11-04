import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationAmendmentDto } from '../application-amendment/application-amendment.dto';
import { ApplicationAmendment } from '../application-amendment/application-amendment.entity';
import { ApplicationAmendmentService } from '../application-amendment/application-amendment.service';
import { ApplicationReconsiderationDto } from '../application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import {
  CARD_SUBTASK_TYPE,
  HomepageSubtaskDTO,
} from '../card/card-subtask/card-subtask.dto';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { RolesGuard } from '../common/authorization/roles-guard.service';
import { UserRoles } from '../common/authorization/roles.decorator';
import { Covenant } from '../covenant/covenant.entity';
import { CovenantService } from '../covenant/covenant.service';
import { PlanningReviewDto } from '../planning-review/planning-review.dto';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { AssigneeDto } from '../user/user.dto';
import { User } from '../user/user.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('home')
@UseGuards(RolesGuard)
export class HomeController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private timeService: ApplicationTimeTrackingService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReviewService: PlanningReviewService,
    private amendmentService: ApplicationAmendmentService,
    private covenantService: CovenantService,
  ) {}

  @Get('/assigned')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignedToMe(@Req() req): Promise<{
    applications: ApplicationDto[];
    reconsiderations: ApplicationReconsiderationDto[];
    planningReviews: PlanningReviewDto[];
    amendments: ApplicationAmendmentDto[];
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

      const amendments = await this.amendmentService.getBy({
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
        amendments: await this.amendmentService.mapToDtos(amendments),
      };
    } else {
      return {
        applications: [],
        reconsiderations: [],
        planningReviews: [],
        amendments: [],
      };
    }
  }

  @Get('/subtask/:subtaskType')
  @UserRoles(...ANY_AUTH_ROLE)
  async getIncompleteSubtasksByType(
    @Param('subtaskType') subtaskType: CARD_SUBTASK_TYPE,
  ): Promise<HomepageSubtaskDTO[]> {
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
    const planningReviewSubtasks = this.mapPlanningReviewsToDtos(
      planningReviewsWithSubtasks,
    );

    const amendmentsWithSubtasks =
      await this.amendmentService.getWithIncompleteSubtaskByType(subtaskType);
    const amendmentSubtasks = this.mapAmendmentsToDtos(amendmentsWithSubtasks);

    const covenantWithSubtasks =
      await this.covenantService.getWithIncompleteSubtaskByType(subtaskType);
    const covenantReviewSubtasks = this.mapCovenantToDtos(covenantWithSubtasks);

    return [
      ...applicationSubtasks,
      ...reconSubtasks,
      ...amendmentSubtasks,
      ...planningReviewSubtasks,
      ...covenantReviewSubtasks,
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

  private mapPlanningReviewsToDtos(planingReviews: PlanningReview[]) {
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

  private mapCovenantToDtos(covenants: Covenant[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const covenant of covenants) {
      for (const subtask of covenant.card.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(covenant.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          paused: false,
          title: `${covenant.fileNumber} (${covenant.applicant})`,
        });
      }
    }
    return result;
  }

  private mapAmendmentsToDtos(amendments: ApplicationAmendment[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const amendment of amendments) {
      for (const subtask of amendment.card.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(amendment.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          paused: false,
          title: `${amendment.application.fileNumber} (${amendment.application.applicant})`,
        });
      }
    }
    return result;
  }
}
