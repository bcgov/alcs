import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import {
  APPLICATION_STATUS,
  ApplicationSubmissionDetailedDto,
} from '../../../services/application-submission/application-submission.dto';

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
  APPLICATION_STATUS = APPLICATION_STATUS;

  constructor(private applicationReviewService: ApplicationSubmissionReviewService, private router: Router) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onReview(fileId: string) {
    if (this.application?.status.code === APPLICATION_STATUS.SUBMITTED_TO_LG) {
      const review = await this.applicationReviewService.startReview(fileId);
      if (!review) {
        return;
      }
    }
    await this.router.navigateByUrl(`application/${fileId}/review`);
  }
}
