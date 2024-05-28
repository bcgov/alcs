import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { TimelineEventDto } from '../../../services/planning-review/planning-review-timeline/planning-review-timeline.dto';
import { PlanningReviewTimelineService } from '../../../services/planning-review/planning-review-timeline/planning-review-timeline.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../services/planning-review/planning-review.service';
import { ToastService } from '../../../services/toast/toast.service';

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

  localGovernments: { label: string; value: string; disabled?: boolean | null }[] = [];
  regions: { label: string; value: string; disabled?: boolean | null }[] = [];

  constructor(
    private planningReviewDetailService: PlanningReviewDetailService,
    private planningReviewService: PlanningReviewService,
    private planningReviewTimelineService: PlanningReviewTimelineService,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((review) => {
      this.planningReview = review;
      if (review) {
        this.loadEvents(review.fileNumber);
        this.loadGovernments();
      }
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions.map((region) => ({
        label: region.label,
        value: region.code,
      }));
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

  private async loadGovernments() {
    const governments = await this.localGovernmentService.listAll();

    if (governments) {
      this.localGovernments = governments
        .filter((gov) => gov.isActive || gov.uuid === this.planningReview?.localGovernment?.uuid)
        .map((government) => ({
          label: government.name,
          value: government.uuid,
          disabled: !government.isActive,
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

  async updateLocalGovernment($event: string | string[] | null) {
    if (this.planningReview && $event && !Array.isArray($event)) {
      const update = await this.planningReviewDetailService.update(this.planningReview.fileNumber, {
        localGovernmentUuid: $event,
      });
      if (update) {
        this.toastService.showSuccessToast('Planning Review updated');
      }
    }
  }

  async updateRegion($event: string | string[] | null) {
    if (this.planningReview && $event && !Array.isArray($event)) {
      const update = await this.planningReviewDetailService.update(this.planningReview.fileNumber, {
        regionCode: $event,
      });
      if (update) {
        this.toastService.showSuccessToast('Planning Review updated');
      }
    }
  }
}
