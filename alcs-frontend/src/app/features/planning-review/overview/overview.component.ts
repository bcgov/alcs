import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
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

  constructor(
    private planningReviewDetailService: PlanningReviewDetailService,
    private planningReviewService: PlanningReviewService,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((review) => {
      this.planningReview = review;
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
}
