import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlanningReviewDetailedDto, PlanningReviewDto, UpdatePlanningReviewDto } from './planning-review.dto';
import { PlanningReviewService } from './planning-review.service';

@Injectable()
export class PlanningReviewDetailService {
  $planningReview = new BehaviorSubject<PlanningReviewDetailedDto | undefined>(undefined);

  constructor(private planningReviewService: PlanningReviewService) {}

  async loadReview(fileNumber: string) {
    this.clearReview();

    const planningReview = await this.planningReviewService.fetchDetailedByFileNumber(fileNumber);
    this.$planningReview.next(planningReview);
  }

  async clearReview() {
    this.$planningReview.next(undefined);
  }

  async update(fileNumber: string, updateDto: UpdatePlanningReviewDto) {
    const updatedApp = await this.planningReviewService.update(fileNumber, updateDto);
    if (updatedApp) {
      this.$planningReview.next(updatedApp);
    }
    return updatedApp;
  }
}
