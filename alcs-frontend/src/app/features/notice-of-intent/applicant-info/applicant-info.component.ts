import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import {
  NoticeOfIntentDto,
  NoticeOfIntentSubmissionDto,
} from '../../../services/notice-of-intent/notice-of-intent.dto';
import { DOCUMENT_TYPE } from '../../../shared/document/document.dto';

@Component({
  selector: 'app-applicant-info',
  templateUrl: './applicant-info.component.html',
  styleUrls: ['./applicant-info.component.scss'],
})
export class ApplicantInfoComponent implements OnInit, OnDestroy {
  fileNumber: string = '';
  applicant: string = '';
  destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;
  noticeOfIntent: NoticeOfIntentDto | undefined;
  submission?: NoticeOfIntentSubmissionDto = undefined;
  isSubmittedToAlc = false;

  constructor(
    private noiDetailService: NoticeOfIntentDetailService,
    private noiSubmissionService: NoticeOfIntentSubmissionService
  ) {}

  ngOnInit(): void {
    this.noiDetailService.$noticeOfIntent.pipe(takeUntil(this.destroy)).subscribe(async (noi) => {
      if (noi) {
        this.noticeOfIntent = noi;
        this.fileNumber = noi.fileNumber;

        this.submission = await this.noiSubmissionService.fetchSubmission(this.fileNumber);
        // TODO is this a thing for noi?
        // const isApplicantSubmission = noi.source === APPLICATION_SYSTEM_SOURCE_TYPES.APPLICANT;

        // this.isSubmittedToAlc = isApplicantSubmission ? !!noi.dateSubmittedToAlc : true;
        this.isSubmittedToAlc = !!noi.dateSubmittedToAlc;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
