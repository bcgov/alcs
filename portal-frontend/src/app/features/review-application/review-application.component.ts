import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import {
  APPLICATION_DOCUMENT,
  ApplicationDocumentDto,
  ApplicationDto,
} from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';

@Component({
  selector: 'app-review-application',
  templateUrl: './review-application.component.html',
  styleUrls: ['./review-application.component.scss'],
})
export class ReviewApplicationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  $application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

  isFirstNationGovernment = true;

  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
        this.loadApplicationReview(fileId);
      }
    });
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;
    });
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((appReview) => {
      this.isFirstNationGovernment = appReview?.isFirstNationGovernment ?? false;
    });
  }

  async loadApplicationReview(fileId: string) {
    await this.applicationReviewService.getByFileId(fileId);
  }

  async loadApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    this.$application.next(application);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
