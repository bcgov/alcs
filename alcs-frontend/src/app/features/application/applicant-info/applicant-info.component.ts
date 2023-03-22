import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { DOCUMENT_TYPE } from '../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../../services/application/application-submission/application-submission.service';
import { ApplicationDto, SubmittedApplicationDto } from '../../../services/application/application.dto';

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
  submission?: SubmittedApplicationDto = undefined;

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
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
