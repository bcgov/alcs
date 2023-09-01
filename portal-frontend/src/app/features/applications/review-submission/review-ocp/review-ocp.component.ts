import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ReviewApplicationSteps } from '../review-submission.component';

@Component({
  selector: 'app-review-ocp',
  templateUrl: './review-ocp.component.html',
  styleUrls: ['./review-ocp.component.scss'],
})
export class ReviewOcpComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = ReviewApplicationSteps.OCP;
  @Input() showErrors = false;

  isOCPDesignation = new FormControl<string | null>(null, [Validators.required]);
  OCPBylawName = new FormControl<string | null>('', [Validators.required]);
  OCPDesignation = new FormControl<string | null>('', [Validators.required]);
  isOCPConsistent = new FormControl<string | null>(null, [Validators.required]);

  ocpForm = new FormGroup({
    isOCPDesignation: this.isOCPDesignation,
    OCPBylawName: this.OCPBylawName,
    OCPDesignation: this.OCPDesignation,
    isOCPConsistent: this.isOCPConsistent,
  });
  private fileId: string | undefined;

  constructor(private applicationReviewService: ApplicationSubmissionReviewService, private router: Router) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;

        if (!applicationReview.isOCPDesignation) {
          this.isOCPDesignation.setValue(applicationReview.isOCPDesignation === null ? null : 'false');
          this.OCPBylawName.disable();
          this.OCPDesignation.disable();
          this.isOCPConsistent.disable();
        } else {
          this.isOCPDesignation.setValue('true');
          this.OCPBylawName.setValue(applicationReview.OCPBylawName);
          this.OCPDesignation.setValue(applicationReview.OCPDesignation);
          if (applicationReview.OCPConsistent !== null) {
            this.isOCPConsistent.setValue(applicationReview.OCPConsistent ? 'true' : 'false');
          }
        }

        if (this.showErrors) {
          this.ocpForm.markAllAsTouched();
        }
      }
    });
  }

  async onSave() {
    await this.saveProgress();
  }

  async onExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  private async saveProgress() {
    if (this.fileId && this.ocpForm.dirty) {
      const ocpDesignation = this.isOCPDesignation.getRawValue();
      let ocpDesignationResult = null;
      if (ocpDesignation !== null) {
        ocpDesignationResult = ocpDesignation === 'true';
      }

      const ocpConsistent = this.isOCPConsistent.getRawValue();
      let ocpConsistentResult = null;
      if (ocpConsistent !== null) {
        ocpConsistentResult = ocpConsistent === 'true';
      }

      await this.applicationReviewService.update(this.fileId, {
        isOCPDesignation: ocpDesignationResult,
        OCPBylawName: this.OCPBylawName.getRawValue(),
        OCPDesignation: this.OCPDesignation.getRawValue(),
        OCPConsistent: ocpConsistentResult,
      });
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onChangeDesignation($event: MatButtonToggleChange) {
    if ($event.value === 'true') {
      this.OCPBylawName.enable();
      this.OCPDesignation.enable();
      this.isOCPConsistent.enable();
    } else {
      this.OCPBylawName.setValue(null);
      this.OCPDesignation.setValue(null);
      this.isOCPConsistent.setValue(null);
      this.OCPBylawName.disable();
      this.OCPDesignation.disable();
      this.isOCPConsistent.disable();
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
