import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { TimelineEventDto } from '../../../services/planning-review/planning-review-timeline/planning-review-timeline.dto';
import { PlanningReviewTimelineService } from '../../../services/planning-review/planning-review-timeline/planning-review-timeline.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../services/planning-review/planning-review.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  planningReview?: PlanningReviewDto;
  types: { label: string; value: string }[] = [];
  events: TimelineEventDto[] = [];

  constructor(
    private planningReviewDetailService: PlanningReviewDetailService,
    private planningReviewService: PlanningReviewService,
    private planningReviewTimelineService: PlanningReviewTimelineService,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((review) => {
      this.planningReview = review;
      if (review) {
        this.loadEvents(review.fileNumber);
      }
    });
    this.loadTypes();
  }

  private async loadTypes() {
    const types = await this.planningReviewService.fetchTypes();
    if (types) {
      this.types = types.map((type) => ({
        label: type.label,
        value: type.code,
      }));
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveType($event: string | string[] | null) {
    if ($event && !Array.isArray($event) && this.planningReview) {
      await this.planningReviewDetailService.update(this.planningReview.fileNumber, {
        typeCode: $event,
      });
    }
  }

  async onSaveStatus($event: string) {
    if (this.planningReview) {
      await this.planningReviewDetailService.update(this.planningReview.fileNumber, {
        open: $event === 'Open',
      });
    }
  }

  private async loadEvents(fileNumber: string) {
    this.events = await this.planningReviewTimelineService.fetchByFileNumber(fileNumber);
  }
}
