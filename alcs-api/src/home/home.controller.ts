import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationModificationDto } from '../decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../decision/application-modification/application-modification.entity';
import { ApplicationModificationService } from '../decision/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../decision/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsideration } from '../decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../decision/application-reconsideration/application-reconsideration.service';
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
import { CovenantDto } from '../covenant/covenant.dto';
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
    private modificationService: ApplicationModificationService,
    private covenantService: CovenantService,
  ) {}

  @Get('/assigned')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignedToMe(@Req() req): Promise<{
    applications: ApplicationDto[];
    reconsiderations: ApplicationReconsiderationDto[];
    planningReviews: PlanningReviewDto[];
    modifications: ApplicationModificationDto[];
    covenants: CovenantDto[];
  }> {
    const userId = req.user.entity.uuid;
    if (userId) {
      const applications = await this.applicationService.getMany({
        card: { assigneeUuid: userId },
      });
      const reconsiderations = await this.reconsiderationService.getBy({
        card: { assigneeUuid: userId },
      });

      const planningReviews = await this.planningReviewService.getBy({
        card: { assigneeUuid: userId },
      });

      const modifications = await this.modificationService.getBy({
        card: { assigneeUuid: userId },
      });

      const covenants = await this.covenantService.getBy({
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
        modifications: await this.modificationService.mapToDtos(modifications),
        covenants: await this.covenantService.mapToDtos(covenants),
      };
    } else {
      return {
        applications: [],
        reconsiderations: [],
        planningReviews: [],
        modifications: [],
        covenants: [],
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

    const modificationsWithSubtasks =
      await this.modificationService.getWithIncompleteSubtaskByType(
        subtaskType,
      );
    const modificationSubtasks = this.mapModificationsToDtos(
      modificationsWithSubtasks,
    );

    const covenantWithSubtasks =
      await this.covenantService.getWithIncompleteSubtaskByType(subtaskType);
    const covenantReviewSubtasks = this.mapCovenantToDtos(covenantWithSubtasks);

    return [
      ...applicationSubtasks,
      ...reconSubtasks,
      ...modificationSubtasks,
      ...planningReviewSubtasks,
      ...covenantReviewSubtasks,
    ];
  }

  private mapReconToDto(recons: ApplicationReconsideration[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const recon of recons) {
      if (!recon.card) {
        continue;
      }

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
      if (!application.card) {
        continue;
      }

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

  private mapModificationsToDtos(modifications: ApplicationModification[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const modification of modifications) {
      if (!modification.card) {
        continue;
      }
      for (const subtask of modification.card.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(modification.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          paused: false,
          title: `${modification.application.fileNumber} (${modification.application.applicant})`,
        });
      }
    }
    return result;
  }
}
