import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';

@Component({
  selector: 'app-review-resolution',
  templateUrl: './review-resolution.component.html',
  styleUrls: ['./review-resolution.component.scss'],
})
export class ReviewResolutionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  isAuthorized = new FormControl<string | null>(null);

  resolutionForm = new FormGroup({
    isAuthorized: this.isAuthorized,
  });
  private fileId: string | undefined;
  isOCPDesignation: boolean | null = null;
  isSubjectToZoning: boolean | null = null;

  constructor(private applicationReviewService: ApplicationReviewService, private router: Router) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;
        this.isOCPDesignation = applicationReview.isOCPDesignation;
        this.isSubjectToZoning = applicationReview.isSubjectToZoning;

        if (applicationReview.isAuthorized !== null) {
          this.isAuthorized.setValue(applicationReview.isAuthorized ? 'true' : 'false');
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
      if (this.isSubjectToZoning || (this.isOCPDesignation && this.isAuthorized.getRawValue() !== null)) {
        await this.applicationReviewService.update(this.fileId, {
          isAuthorized: this.isAuthorized.getRawValue() === 'true',
        });
      } else {
        await this.applicationReviewService.update(this.fileId, {
          isAuthorized: null,
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
