import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import {
  SUBMISSION_STATUS,
  ApplicationSubmissionDetailedDto,
} from '../../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-alc-review',
  templateUrl: './alc-review.component.html',
  styleUrls: ['./alc-review.component.scss'],
})
export class AlcReviewComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  @Input() $application = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
  @Input() $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  application: ApplicationSubmissionDetailedDto | undefined;
  SUBMISSION_STATUS = SUBMISSION_STATUS;
  showUpdateAfterSubmitLabel = false;
  showALCSection = false;

  constructor(
    private applicationReviewService: ApplicationSubmissionReviewService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;

      this.showUpdateAfterSubmitLabel =
        !!application?.status.code &&
        [
          SUBMISSION_STATUS.IN_PROGRESS,
          SUBMISSION_STATUS.IN_REVIEW_BY_LG,
          SUBMISSION_STATUS.INCOMPLETE,
          SUBMISSION_STATUS.WRONG_GOV,
          SUBMISSION_STATUS.SUBMITTED_TO_LG,
          SUBMISSION_STATUS.RETURNED_TO_LG,
        ].includes(application?.status.code);

      this.showALCSection =
        !!application?.status.code &&
        [
          SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE,
          SUBMISSION_STATUS.RECEIVED_BY_ALC,
          SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
          SUBMISSION_STATUS.ALC_DECISION,
        ].includes(application?.status.code);
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onReview(fileId: string) {
    if (this.application?.status.code === SUBMISSION_STATUS.SUBMITTED_TO_LG) {
      const review = await this.applicationReviewService.startReview(fileId);
      if (!review) {
        return;
      }
    }
    await this.router.navigateByUrl(`application/${fileId}/review`);
  }
}
