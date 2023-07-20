import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { DOCUMENT_TYPE } from '../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../../services/application/application-submission/application-submission.service';
import {
  APPLICATION_SYSTEM_SOURCE_TYPES,
  ApplicationDto,
  ApplicationSubmissionDto,
  SUBMISSION_STATUS,
} from '../../../services/application/application.dto';

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
  application: ApplicationDto | undefined;
  submission?: ApplicationSubmissionDto = undefined;
  isSubmitted = false;
  wasSubmittedToLfng = false;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe(async (application) => {
      if (application) {
        this.application = application;
        this.fileNumber = application.fileNumber;

        this.submission = await this.applicationSubmissionService.fetchSubmission(this.fileNumber);
        const isApplicantSubmission = application.source === APPLICATION_SYSTEM_SOURCE_TYPES.APPLICANT;

        this.isSubmitted = isApplicantSubmission ? !!application.dateSubmittedToAlc : true;

        this.wasSubmittedToLfng =
          isApplicantSubmission &&
          [
            SUBMISSION_STATUS.SUBMITTED_TO_LG,
            SUBMISSION_STATUS.IN_REVIEW_BY_LG,
            SUBMISSION_STATUS.WRONG_GOV,
            SUBMISSION_STATUS.INCOMPLETE,
          ].includes(this.submission?.status?.code);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
