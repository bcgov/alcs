import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';

@Component({
  selector: 'app-review-submit[stepper]',
  templateUrl: './review-submit.component.html',
  styleUrls: ['./review-submit.component.scss'],
})
export class ReviewSubmitComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  _applicationReview: ApplicationReviewDto | undefined;
  showErrors = false;

  @Input() stepper!: MatStepper;

  constructor(private router: Router, private applicationReviewService: ApplicationReviewService) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this._applicationReview = applicationReview;
      }
    });
  }

  async onExit() {
    if (this._applicationReview) {
      await this.router.navigateByUrl(`/application/${this._applicationReview.applicationFileNumber}`);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onEditSection(index: number) {
    this.stepper.selectedIndex = index;
  }

  onSubmit() {
    this.runValidation();
    const el = document.getElementsByClassName('no-data');

    if (el && el.length > 0) {
      el[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  private runValidation() {
    this.showErrors = true;
  }
}
