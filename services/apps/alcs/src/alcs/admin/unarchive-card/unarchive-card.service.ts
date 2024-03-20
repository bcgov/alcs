import { Injectable } from '@nestjs/common';
import { ApplicationModificationService } from '../../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../../application/application.service';
import { NoticeOfIntentModificationService } from '../../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NotificationService } from '../../notification/notification.service';
import { PlanningReferralService } from '../../planning-review/planning-referral/planning-referral.service';

@Injectable()
export class UnarchiveCardService {
  constructor(
    private applicationService: ApplicationService,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService,
    private notificationService: NotificationService,
    private planningReferralService: PlanningReferralService,
  ) {}

  async fetchByFileId(fileId: string) {
    const result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[] = [];
    const application = await this.applicationService.getDeletedCard(fileId);
    if (application) {
      result.push({
        cardUuid: application.cardUuid,
        createdAt: application.createdAt.getTime(),
        type: 'Application',
        status: application.card!.status.label,
      });
    }

    await this.fetchAndMapRecons(fileId, result);
    await this.fetchAndMapPlanningReferrals(fileId, result);
    await this.fetchAndMapModifications(fileId, result);
    await this.fetchAndMapNOIs(fileId, result);
    await this.fetchAndMapNotifications(fileId, result);

    return result;
  }

  private async fetchAndMapModifications(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const modifications =
      await this.modificationService.getDeletedCards(fileId);
    for (const modification of modifications) {
      result.push({
        cardUuid: modification.cardUuid ?? '',
        createdAt: modification.auditCreatedAt.getTime(),
        type: 'Modification',
        status: modification.card!.status.label,
      });
    }
  }

  private async fetchAndMapRecons(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const reconsiderations =
      await this.reconsiderationService.getDeletedCards(fileId);
    for (const reconsideration of reconsiderations) {
      result.push({
        cardUuid: reconsideration.cardUuid ?? '',
        createdAt: reconsideration.auditCreatedAt.getTime(),
        type: 'Reconsideration',
        status: reconsideration.card!.status.label,
      });
    }
  }

  private async fetchAndMapNOIs(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const noticeOfIntents =
      await this.noticeOfIntentService.getDeletedCards(fileId);
    for (const noi of noticeOfIntents) {
      result.push({
        cardUuid: noi.cardUuid,
        createdAt: noi.auditCreatedAt.getTime(),
        type: 'NOI',
        status: noi.card!.status.label,
      });
    }

    const modificationNOIs =
      await this.noticeOfIntentModificationService.getDeletedCards(fileId);

    for (const noi of modificationNOIs) {
      result.push({
        cardUuid: noi.cardUuid ?? '',
        createdAt: noi.auditCreatedAt.getTime(),
        type: 'NOI MODI',
        status: noi.card!.status.label,
      });
    }
  }

  private async fetchAndMapNotifications(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const notifications =
      await this.notificationService.getDeletedCards(fileId);
    for (const notification of notifications) {
      result.push({
        cardUuid: notification.cardUuid,
        createdAt: notification.auditCreatedAt.getTime(),
        type: 'NOTI',
        status: notification.card!.status.label,
      });
    }
  }

  private async fetchAndMapPlanningReferrals(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const notifications =
      await this.planningReferralService.getDeletedCards(fileId);
    for (const referral of notifications) {
      result.push({
        cardUuid: referral.cardUuid,
        createdAt: referral.auditCreatedAt.getTime(),
        type: 'PLAN',
        status: referral.card!.status.label,
      });
    }
  }
}
