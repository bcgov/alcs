import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ReviewApplicationFngSteps, ReviewApplicationSteps } from '../review-submission.component';

@Component({
  selector: 'app-review-resolution',
  templateUrl: './review-resolution.component.html',
  styleUrls: ['./review-resolution.component.scss'],
})
export class ReviewResolutionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep: ReviewApplicationSteps | ReviewApplicationFngSteps = ReviewApplicationSteps.Resolution;
  @Input() showErrors = false;

  isAuthorized = new FormControl<string | null>(null, [Validators.required]);

  resolutionForm = new FormGroup({
    isAuthorized: this.isAuthorized,
  });
  private fileId: string | undefined;
  isOCPDesignation: boolean | null = null;
  isSubjectToZoning: boolean | null = null;
  isFirstNationGovernment = false;

  constructor(private applicationReviewService: ApplicationSubmissionReviewService) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;
        this.isOCPDesignation = applicationReview.isOCPDesignation;
        this.isSubjectToZoning = applicationReview.isSubjectToZoning;
        this.isFirstNationGovernment = applicationReview.isFirstNationGovernment;
        if (this.isFirstNationGovernment) {
          this.currentStep = ReviewApplicationFngSteps.Resolution;
        }

        if (applicationReview.isAuthorized !== null) {
          this.isAuthorized.setValue(applicationReview.isAuthorized ? 'true' : 'false');
        }

        if (this.showErrors) {
          this.resolutionForm.markAllAsTouched();
        }
      }
    });
  }

  async onSave() {
    await this.saveProgress();
  }

  private async saveProgress() {
    if (this.fileId && this.resolutionForm.dirty) {
      if (this.isAuthorized.getRawValue() !== null) {
        if (this.isFirstNationGovernment || this.isSubjectToZoning || this.isOCPDesignation) {
          await this.applicationReviewService.update(this.fileId, {
            isAuthorized: this.isAuthorized.getRawValue() === 'true',
          });
          return;
        }
      }
      await this.applicationReviewService.update(this.fileId, {
        isAuthorized: null,
      });
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
