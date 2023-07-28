import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDto, UpdateApplicationDto } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-proposal-incl',
  templateUrl: './incl.component.html',
  styleUrls: ['./incl.component.scss'],
})
export class InclProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  applicantType: string | undefined;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.applicationSubmissionService
          .fetchSubmission(application.fileNumber)
          .then(
            (submission) =>
              (this.applicantType =
                submission.inclGovernmentOwnsAllParcels === false ? 'L/FNG Initiated' : 'Land Owner')
          );
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
