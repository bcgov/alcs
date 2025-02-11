import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { In, Not } from 'typeorm';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { AssigneeDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';
import { ApplicationModificationDto } from '../application-decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../application-decision/application-modification/application-modification.entity';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../application-decision/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsideration } from '../application-decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { CARD_STATUS } from '../card/card-status/card-status.entity';
import { CARD_SUBTASK_TYPE, HomepageSubtaskDTO, PARENT_TYPE } from '../card/card-subtask/card-subtask.dto';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { InquiryDto } from '../inquiry/inquiry.dto';
import { Inquiry } from '../inquiry/inquiry.entity';
import { InquiryService } from '../inquiry/inquiry.service';
import { NoticeOfIntentModificationDto } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentModificationService } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { NotificationDto } from '../notification/notification.dto';
import { Notification } from '../notification/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { PlanningReferral } from '../planning-review/planning-referral/planning-referral.entity';
import { PlanningReferralService } from '../planning-review/planning-referral/planning-referral.service';
import { PlanningReferralDto } from '../planning-review/planning-review.dto';
import { HolidayService } from '../admin/holiday/holiday.service';
import { ApplicationDecisionConditionHomeDto } from '../application-decision/application-decision-condition/application-decision-condition.dto';
import { ApplicationDecisionConditionService } from '../application-decision/application-decision-condition/application-decision-condition.service';
import { ApplicationDecisionV2Service } from '../application-decision/application-decision-v2/application-decision/application-decision-v2.service';

const HIDDEN_CARD_STATUSES = [CARD_STATUS.CANCELLED, CARD_STATUS.DECISION_RELEASED];

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('home')
@UseGuards(RolesGuard)
export class HomeController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private timeService: ApplicationTimeTrackingService,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService,
    private notificationService: NotificationService,
    private planningReferralService: PlanningReferralService,
    private inquiryService: InquiryService,
    private holidayService: HolidayService,
    private applicationDecisionConditionService: ApplicationDecisionConditionService,
    private decisionService: ApplicationDecisionV2Service,
  ) {}

  @Get('/assigned')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignedToMe(@Req() req): Promise<{
    noticeOfIntents: NoticeOfIntentDto[];
    noticeOfIntentModifications: NoticeOfIntentModificationDto[];
    applications: ApplicationDto[];
    reconsiderations: ApplicationReconsiderationDto[];
    planningReferrals: PlanningReferralDto[];
    modifications: ApplicationModificationDto[];
    notifications: NotificationDto[];
    inquiries: InquiryDto[];
    applicationsConditions: ApplicationDecisionConditionHomeDto[];
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
    const assignedConditionFindOptions = {
      conditionCard: {
        card: {
          assigneeUuid: userId,
          status: {
            code: Not(In(HIDDEN_CARD_STATUSES)),
          },
        },
      },
    };

    if (userId) {
      const applications = await this.applicationService.getMany(assignedFindOptions);
      const reconsiderations = await this.reconsiderationService.getBy(assignedFindOptions);

      const planningReviews = await this.planningReferralService.getBy(assignedFindOptions);

      const modifications = await this.modificationService.getBy(assignedFindOptions);

      const noticeOfIntents = await this.noticeOfIntentService.getBy(assignedFindOptions);

      const noticeOfIntentModifications = await this.noticeOfIntentModificationService.getBy(assignedFindOptions);

      const notifications = await this.notificationService.getBy(assignedFindOptions);

      const inquiries = await this.inquiryService.getBy(assignedFindOptions);

      const conditions = await this.applicationDecisionConditionService.getBy(assignedConditionFindOptions);

      return {
        noticeOfIntents: await this.noticeOfIntentService.mapToDtos(noticeOfIntents),
        noticeOfIntentModifications:
          await this.noticeOfIntentModificationService.mapToDtos(noticeOfIntentModifications),
        applications: await this.applicationService.mapToDtos(applications),
        reconsiderations: await this.reconsiderationService.mapToDtos(reconsiderations),
        planningReferrals: await this.planningReferralService.mapToDtos(planningReviews),
        modifications: await this.modificationService.mapToDtos(modifications),
        notifications: await this.notificationService.mapToDtos(notifications),
        inquiries: await this.inquiryService.mapToDtos(inquiries),
        applicationsConditions: await this.applicationDecisionConditionService.mapToDtos(conditions),
      };
    } else {
      return {
        noticeOfIntents: [],
        noticeOfIntentModifications: [],
        applications: [],
        reconsiderations: [],
        planningReferrals: [],
        modifications: [],
        notifications: [],
        inquiries: [],
        applicationsConditions: [],
      };
    }
  }

  @Get('/subtask/:subtaskType')
  @UserRoles(...ANY_AUTH_ROLE)
  async getIncompleteSubtasksByType(
    @Param('subtaskType') subtaskType: CARD_SUBTASK_TYPE,
  ): Promise<HomepageSubtaskDTO[]> {
    const applicationsWithSubtasks = await this.applicationService.getWithIncompleteSubtaskByType(subtaskType);
    const applicationSubtasks = await this.mapApplicationsToDtos(applicationsWithSubtasks);

    const reconsiderationWithSubtasks = await this.reconsiderationService.getWithIncompleteSubtaskByType(subtaskType);
    const reconSubtasks = await this.mapReconToDto(reconsiderationWithSubtasks);

    const planningReferralsWithSubtasks =
      await this.planningReferralService.getWithIncompleteSubtaskByType(subtaskType);
    const planningReferralSubtasks = await this.mapPlanningReferralsToDtos(planningReferralsWithSubtasks);

    const modificationsWithSubtasks = await this.modificationService.getWithIncompleteSubtaskByType(subtaskType);
    const modificationSubtasks = await this.mapModificationsToDtos(modificationsWithSubtasks);

    const noiSubtasks = await this.noticeOfIntentService.getWithIncompleteSubtaskByType(subtaskType);
    const noticeOfIntentSubtasks = await this.mapNoticeOfIntentToDtos(noiSubtasks);

    const noiModificationsWithSubtasks =
      await this.noticeOfIntentModificationService.getWithIncompleteSubtaskByType(subtaskType);
    const noiModificationsSubtasks = await this.mapNoiModificationsToDtos(noiModificationsWithSubtasks);

    const notificationsWithSubtasks = await this.notificationService.getWithIncompleteSubtaskByType(subtaskType);

    const notificationSubtasks = await this.mapNotificationsToDtos(notificationsWithSubtasks);

    const inquiriesWIthSubtasks = await this.inquiryService.getWithIncompleteSubtaskByType(subtaskType);

    const inquirySubtasks = await this.mapInquiriesToDtos(inquiriesWIthSubtasks);

    return [
      ...noticeOfIntentSubtasks,
      ...applicationSubtasks,
      ...reconSubtasks,
      ...modificationSubtasks,
      ...noiModificationsSubtasks,
      ...planningReferralSubtasks,
      ...notificationSubtasks,
      ...inquirySubtasks,
    ];
  }

  private async mapReconToDto(recons: ApplicationReconsideration[]) {
    const result: HomepageSubtaskDTO[] = [];
    const holidays = await this.holidayService.fetchAllHolidays();
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
          parentType: PARENT_TYPE.RECONSIDERATION,
          subtaskDays:
            subtask.type.code === CARD_SUBTASK_TYPE.GIS
              ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
              : 0,
        });
      }
    }
    return result;
  }

  private async mapApplicationsToDtos(applications: Application[]) {
    const applicationTimes = await this.timeService.fetchActiveTimes(applications);

    const appPausedMap = await this.timeService.getPausedStatus(applications);
    const holidays = await this.holidayService.fetchAllHolidays();
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
          parentType: PARENT_TYPE.APPLICATION,
          subtaskDays:
            subtask.type.code === CARD_SUBTASK_TYPE.GIS
              ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
              : 0,
        });
      }
    }
    return result;
  }

  private async mapPlanningReferralsToDtos(planningReferrals: PlanningReferral[]) {
    const result: HomepageSubtaskDTO[] = [];
    const holidays = await this.holidayService.fetchAllHolidays();
    for (const planningReferral of planningReferrals) {
      for (const subtask of planningReferral.card.subtasks) {
        result.push({
          type: subtask.type,
          createdAt: subtask.createdAt.getTime(),
          assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
          uuid: subtask.uuid,
          card: this.mapper.map(planningReferral.card, Card, CardDto),
          completedAt: subtask.completedAt?.getTime(),
          paused: false,
          title: `${planningReferral.planningReview.fileNumber} (${planningReferral.planningReview.documentName})`,
          parentType: PARENT_TYPE.PLANNING_REVIEW,
          appType: planningReferral.planningReview.type,
          subtaskDays:
            subtask.type.code === CARD_SUBTASK_TYPE.GIS
              ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
              : 0,
        });
      }
    }
    return result;
  }

  private async mapNoticeOfIntentToDtos(noticeOfIntents: NoticeOfIntent[]) {
    const uuids = noticeOfIntents.map((noi) => noi.uuid);
    const timeMap = await this.noticeOfIntentService.getTimes(uuids);
    const holidays = await this.holidayService.fetchAllHolidays();

    const result: HomepageSubtaskDTO[] = [];
    for (const noticeOfIntent of noticeOfIntents) {
      const activeDays = timeMap.get(noticeOfIntent.uuid)?.activeDays;

      if (noticeOfIntent.card) {
        for (const subtask of noticeOfIntent.card.subtasks) {
          result.push({
            activeDays: activeDays ?? undefined,
            type: subtask.type,
            createdAt: subtask.createdAt.getTime(),
            assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
            uuid: subtask.uuid,
            card: this.mapper.map(noticeOfIntent.card, Card, CardDto),
            completedAt: subtask.completedAt?.getTime(),
            paused: false,
            title: `${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`,
            parentType: PARENT_TYPE.NOTICE_OF_INTENT,
            subtaskDays:
              subtask.type.code === CARD_SUBTASK_TYPE.GIS
                ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
                : 0,
          });
        }
      }
    }
    return result;
  }

  private async mapModificationsToDtos(modifications: ApplicationModification[]) {
    const result: HomepageSubtaskDTO[] = [];
    const holidays = await this.holidayService.fetchAllHolidays();
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
          parentType: PARENT_TYPE.MODIFICATION,
          subtaskDays:
            subtask.type.code === CARD_SUBTASK_TYPE.GIS
              ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
              : 0,
        });
      }
    }
    return result;
  }

  private async mapNoiModificationsToDtos(modifications: NoticeOfIntentModification[]) {
    const result: HomepageSubtaskDTO[] = [];
    const holidays = await this.holidayService.fetchAllHolidays();
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
          title: `${modification.noticeOfIntent.fileNumber} (${modification.noticeOfIntent.applicant})`,
          parentType: PARENT_TYPE.MODIFICATION,
          subtaskDays:
            subtask.type.code === CARD_SUBTASK_TYPE.GIS
              ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
              : 0,
        });
      }
    }
    return result;
  }

  private async mapNotificationsToDtos(notifications: Notification[]) {
    const result: HomepageSubtaskDTO[] = [];
    const holidays = await this.holidayService.fetchAllHolidays();
    for (const notification of notifications) {
      if (notification.card) {
        for (const subtask of notification.card.subtasks) {
          result.push({
            type: subtask.type,
            createdAt: subtask.createdAt.getTime(),
            assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
            uuid: subtask.uuid,
            card: this.mapper.map(notification.card, Card, CardDto),
            completedAt: subtask.completedAt?.getTime(),
            paused: false,
            title: `${notification.fileNumber} (${notification.applicant})`,
            parentType: PARENT_TYPE.NOTIFICATION,
            appType: notification.type,
            subtaskDays:
              subtask.type.code === CARD_SUBTASK_TYPE.GIS
                ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
                : 0,
          });
        }
      }
    }
    return result;
  }

  private async mapInquiriesToDtos(inquiries: Inquiry[]) {
    const result: HomepageSubtaskDTO[] = [];
    const holidays = await this.holidayService.fetchAllHolidays();
    for (const inquiry of inquiries) {
      if (inquiry.card) {
        for (const subtask of inquiry.card.subtasks) {
          result.push({
            type: subtask.type,
            createdAt: subtask.createdAt.getTime(),
            assignee: this.mapper.map(subtask.assignee, User, AssigneeDto),
            uuid: subtask.uuid,
            card: this.mapper.map(inquiry.card, Card, CardDto),
            completedAt: subtask.completedAt?.getTime(),
            paused: false,
            title: `${inquiry.fileNumber} (${inquiry.inquirerLastName ?? 'Unknown'})`,
            parentType: PARENT_TYPE.INQUIRY,
            appType: inquiry.type,
            subtaskDays:
              subtask.type.code === CARD_SUBTASK_TYPE.GIS
                ? this.holidayService.calculateBusinessDays(subtask.createdAt, new Date(), holidays)
                : 0,
          });
        }
      }
    }
    return result;
  }
}
