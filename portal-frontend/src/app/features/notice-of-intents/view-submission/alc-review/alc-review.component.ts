import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentSubmissionDetailedDto,
} from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';

@Component({
  selector: 'app-alc-review',
  templateUrl: './alc-review.component.html',
  styleUrls: ['./alc-review.component.scss'],
})
export class AlcReviewComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  @Input() $noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
  @Input() $noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);

  noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;
  NOI_SUBMISSION_STATUS = NOI_SUBMISSION_STATUS;

  constructor() {}

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      this.noiSubmission = noiSubmission;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
