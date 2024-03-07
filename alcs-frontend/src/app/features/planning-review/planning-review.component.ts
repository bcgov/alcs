import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { PlanningReviewDetailService } from '../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDetailedDto, PlanningReviewDto } from '../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../services/planning-review/planning-review.service';
import { OverviewComponent } from './overview/overview.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
  },
];

@Component({
  selector: 'app-planning-review',
  templateUrl: './planning-review.component.html',
  styleUrls: ['./planning-review.component.scss'],
})
export class PlanningReviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  planningReview?: PlanningReviewDetailedDto;
  fileNumber?: string;
  childRoutes = childRoutes;

  constructor(
    private planningReviewService: PlanningReviewDetailService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.$destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      await this.loadReview();
    });

    this.planningReviewService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((planningReview) => {
      this.planningReview = planningReview;
    });
  }

  private async loadReview() {
    if (this.fileNumber) {
      await this.planningReviewService.loadReview(this.fileNumber);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
