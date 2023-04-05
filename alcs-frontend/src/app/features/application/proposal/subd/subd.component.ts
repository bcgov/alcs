import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { ApplicationSubmissionDto } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-proposal-subd',
  templateUrl: './subd.component.html',
  styleUrls: ['./sub.dcomponent.scss'],
})
export class SubdProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationSubmission: ApplicationSubmissionDto | undefined;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.loadSubmission(application.fileNumber);
      }
    });
  }

  async loadSubmission(fileNumber: string) {
    this.applicationSubmission = await this.applicationSubmissionService.fetchSubmission(fileNumber);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
