import { Dialog } from '@angular/cdk/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PlanningReferralService } from '../../../services/planning-review/planning-referral.service';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import {
  PlanningReferralDto,
  PlanningReviewDto,
  UpdatePlanningReferralDto,
} from '../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../services/planning-review/planning-review.service';
import { CreatePlanningReferralDialogComponent } from './create/create-planning-referral-dialog.component';

@Component({
  selector: 'app-overview',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss'],
})
export class ReferralComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  planningReview?: PlanningReviewDto;
  planingReferrals: PlanningReferralDto[] = [];
  types: { label: string; value: string }[] = [];

  minReceivedDate = 0;

  constructor(
    private planningReviewDetailService: PlanningReviewDetailService,
    private planningReferralService: PlanningReferralService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((review) => {
      if (review) {
        this.planningReview = review;
        this.planingReferrals = review.referrals;

        for (const review of this.planingReferrals) {
          this.minReceivedDate = Math.max(review.submissionDate, this.minReceivedDate);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onCreate() {
    if (this.planningReview) {
      const dialog = this.dialog.open(CreatePlanningReferralDialogComponent, {
        data: {
          planningReviewUuid: this.planningReview?.uuid,
          minReceivedDate: this.minReceivedDate,
        },
      });

      dialog.beforeClosed().subscribe((didSave) => {
        if (didSave && this.planningReview) {
          this.planningReviewDetailService.loadReview(this.planningReview.fileNumber);
        }
      });
    }
  }

  async updateReferralField(uuid: string, fieldKey: keyof UpdatePlanningReferralDto, $event: string | number | null) {
    if (this.planningReview) {
      await this.planningReferralService.update(uuid, {
        [fieldKey]: $event,
      });
      this.planningReviewDetailService.loadReview(this.planningReview.fileNumber);
    }
  }

  async onDelete(uuid: string) {
    if (this.planningReview) {
      await this.planningReferralService.delete(uuid);
      this.planningReviewDetailService.loadReview(this.planningReview.fileNumber);
    }
  }
}
