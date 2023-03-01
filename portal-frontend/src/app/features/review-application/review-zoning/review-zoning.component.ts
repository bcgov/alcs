import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';
import { ReviewApplicationSteps } from '../review-application.component';

@Component({
  selector: 'app-review-zoning',
  templateUrl: './review-zoning.component.html',
  styleUrls: ['./review-zoning.component.scss'],
})
export class ReviewZoningComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = ReviewApplicationSteps.Zoning;

  isSubjectToZoning = new FormControl<string | null>(null);
  zoningBylawName = new FormControl<string | null>('');
  zoningMinimumLotSize = new FormControl<string | null>('');
  zoningDesignation = new FormControl<string | null>('');
  isZoningConsistent = new FormControl<string | null>(null);

  zoningForm = new FormGroup({
    isSubjectToZoning: this.isSubjectToZoning,
    zoningBylawName: this.zoningBylawName,
    zoningMinimumLotSize: this.zoningMinimumLotSize,
    zoningDesignation: this.zoningDesignation,
    isZoningConsistent: this.isZoningConsistent,
  });
  private fileId: string | undefined;

  constructor(private applicationReviewService: ApplicationReviewService, private router: Router) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;

        if (!applicationReview.isSubjectToZoning) {
          this.isSubjectToZoning.setValue(applicationReview.isSubjectToZoning === null ? null : 'false');
          this.zoningBylawName.disable();
          this.zoningMinimumLotSize.disable();
          this.zoningDesignation.disable();
          this.isZoningConsistent.disable();
        } else {
          this.isSubjectToZoning.setValue('true');
          this.zoningBylawName.setValue(applicationReview.zoningBylawName);
          this.zoningMinimumLotSize.setValue(applicationReview.zoningMinimumLotSize);
          this.zoningDesignation.setValue(applicationReview.zoningDesignation);
          if (applicationReview.isZoningConsistent !== null) {
            this.isZoningConsistent.setValue(applicationReview.isZoningConsistent ? 'true' : 'false');
          }
        }
      }
    });
  }

  async onSave() {
    await this.saveProgress();
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.saveProgress();
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  private async saveProgress() {
    if (this.fileId) {
      const isSubjectToZoning = this.isSubjectToZoning.getRawValue();
      let subjectToZoningResult = null;
      if (isSubjectToZoning !== null) {
        subjectToZoningResult = isSubjectToZoning === 'true';
      }

      const isZoningConsistent = this.isZoningConsistent.getRawValue();
      let zoningConsistentResult = null;
      if (isZoningConsistent !== null) {
        zoningConsistentResult = isZoningConsistent === 'true';
      }

      await this.applicationReviewService.update(this.fileId, {
        isSubjectToZoning: subjectToZoningResult,
        zoningBylawName: this.zoningBylawName.getRawValue(),
        zoningMinimumLotSize: this.zoningMinimumLotSize.getRawValue(),
        zoningDesignation: this.zoningDesignation.getRawValue(),
        isZoningConsistent: zoningConsistentResult,
      });
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onChangeDesignation($event: MatButtonToggleChange) {
    if ($event.value === 'true') {
      this.zoningBylawName.enable();
      this.zoningMinimumLotSize.enable();
      this.isZoningConsistent.enable();
      this.zoningDesignation.enable();
    } else {
      this.zoningBylawName.setValue(null);
      this.zoningMinimumLotSize.setValue(null);
      this.isZoningConsistent.setValue(null);
      this.zoningDesignation.setValue(null);
      this.zoningBylawName.disable();
      this.zoningMinimumLotSize.disable();
      this.isZoningConsistent.disable();
      this.zoningDesignation.disable();
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
