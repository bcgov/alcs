import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';

@Component({
  selector: 'app-review-attachments',
  templateUrl: './review-attachments.component.html',
  styleUrls: ['./review-attachments.component.scss'],
})
export class ReviewAttachmentsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  private fileId: string | undefined;

  constructor(private router: Router, private applicationReviewService: ApplicationReviewService) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;
      }
    });
  }

  async onExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
