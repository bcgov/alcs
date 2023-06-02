import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { In, Not } from 'typeorm';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { CARD_STATUS } from '../card/card-status/card-status.entity';
import {
  CARD_SUBTASK_TYPE,
  HomepageSubtaskDTO,
} from '../card/card-subtask/card-subtask.dto';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { CovenantDto } from '../covenant/covenant.dto';
import { Covenant } from '../covenant/covenant.entity';
import { CovenantService } from '../covenant/covenant.service';
import { ApplicationModificationDto } from '../application-decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../application-decision/application-modification/application-modification.entity';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../application-decision/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsideration } from '../application-decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { NoticeOfIntentDto } from '../notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { PlanningReviewDto } from '../planning-review/planning-review.dto';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { AssigneeDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';

const HIDDEN_CARD_STATUSES = [
  CARD_STATUS.CANCELLED,
  CARD_STATUS.DECISION_RELEASED,
];

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
    private noticeOfIntentService: NoticeOfIntentService,
  ) {}

  @Get('/assigned')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignedToMe(@Req() req): Promise<{
    noticeOfIntents: NoticeOfIntentDto[];
    applications: ApplicationDto[];
    reconsiderations: ApplicationReconsiderationDto[];
    planningReviews: PlanningReviewDto[];
    modifications: ApplicationModificationDto[];
    covenants: CovenantDto[];
  }> {
    const userId = req.user.entity.uuid;
    const assignedFindOptions = {
      card: {
        assigneeUuid: userId,
        status: {
          code: Not(In(HIDDEN_CARD_STATUSES)),
        },
      },
    };

    if (userId) {
      const applications = await this.applicationService.getMany(
        assignedFindOptions,
      );
      const reconsiderations = await this.reconsiderationService.getBy(
        assignedFindOptions,
      );

      const planningReviews = await this.planningReviewService.getBy(
        assignedFindOptions,
      );

      const modifications = await this.modificationService.getBy(
        assignedFindOptions,
      );

      const covenants = await this.covenantService.getBy(assignedFindOptions);

      const noticeOfIntents = await this.noticeOfIntentService.getBy(
        assignedFindOptions,
      );

      return {
        noticeOfIntents: await this.noticeOfIntentService.mapToDtos(
          noticeOfIntents,
        ),
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
        noticeOfIntents: [],
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

    const noiSubtasks =
      await this.noticeOfIntentService.getWithIncompleteSubtaskByType(
        subtaskType,
      );
    const noticeOfIntentSubtasks = this.mapNoticeOfIntentToDtos(noiSubtasks);

    return [
      ...noticeOfIntentSubtasks,
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
          appType: recon.application.type,
          parentType: 'reconsideration',
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
          appType: application.type,
          parentType: 'application',
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
          parentType: 'planning-review',
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
          parentType: 'covenant',
        });
      }
    }
    return result;
  }

  private mapNoticeOfIntentToDtos(noticeOfIntents: NoticeOfIntent[]) {
    const result: HomepageSubtaskDTO[] = [];
    for (const noticeOfIntent of noticeOfIntents) {
      if (noticeOfIntent.card) {
        for (const subtask of noticeOfIntent.card.subtasks) {
          result.push({
            type: subtask.type,
            createdAt: subtask.createdAt.getTime(),
            assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
            uuid: subtask.uuid,
            card: this.mapper.map(noticeOfIntent.card, Card, CardDto),
            completedAt: subtask.completedAt?.getTime(),
            paused: false,
            title: `${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`,
            parentType: 'notice-of-intent',
          });
        }
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
          appType: modification.application.type,
          parentType: 'modification',
        });
      }
    }
    return result;
  }
}
