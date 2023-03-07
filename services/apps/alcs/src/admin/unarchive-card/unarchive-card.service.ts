import { Injectable } from '@nestjs/common';
import { ApplicationService } from '../../application/application.service';
import { CovenantService } from '../../covenant/covenant.service';
import { ApplicationModificationService } from '../../decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../decision/application-reconsideration/application-reconsideration.service';
import { PlanningReviewService } from '../../planning-review/planning-review.service';

@Injectable()
export class UnarchiveCardService {
  constructor(
    private applicationService: ApplicationService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReviewService: PlanningReviewService,
    private modificationService: ApplicationModificationService,
    private covenantService: CovenantService,
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
    await this.fetchAndMapPlanningReviews(fileId, result);
    await this.fetchAndMapModifications(fileId, result);
    await this.fetchAndMapCovenants(fileId, result);

    return result;
  }

  private async fetchAndMapCovenants(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const covenants = await this.covenantService.getDeletedCards(fileId);
    for (const covenant of covenants) {
      result.push({
        cardUuid: covenant.cardUuid,
        createdAt: covenant.auditCreatedAt.getTime(),
        type: 'Covenant',
        status: covenant.card!.status.label,
      });
    }
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
    const modifications = await this.modificationService.getDeletedCards(
      fileId,
    );
    for (const modification of modifications) {
      result.push({
        cardUuid: modification.cardUuid,
        createdAt: modification.auditCreatedAt.getTime(),
        type: 'Modification',
        status: modification.card!.status.label,
      });
    }
  }

  private async fetchAndMapPlanningReviews(
    fileId: string,
    result: {
      cardUuid: string;
      type: string;
      status: string;
      createdAt: number;
    }[],
  ) {
    const planningReviews = await this.planningReviewService.getDeletedCards(
      fileId,
    );
    for (const planningReview of planningReviews) {
      result.push({
        cardUuid: planningReview.cardUuid,
        createdAt: planningReview.auditCreatedAt.getTime(),
        type: 'Planning Review',
        status: planningReview.card!.status.label,
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
    const reconsiderations = await this.reconsiderationService.getDeletedCards(
      fileId,
    );
    for (const reconsideration of reconsiderations) {
      result.push({
        cardUuid: reconsideration.cardUuid,
        createdAt: reconsideration.auditCreatedAt.getTime(),
        type: 'Reconsideration',
        status: reconsideration.card!.status.label,
      });
    }
  }
}
