import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { ApplicationSubmissionDto, ProposedLot } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-proposal-subd',
  templateUrl: './subd.component.html',
  styleUrls: ['./sub.dcomponent.scss'],
})
export class SubdProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  proposedLots: ProposedLot[] = [];
  private fileNumber: string | undefined;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.loadSubmission(application.fileNumber);
      }
    });
  }

  async loadSubmission(fileNumber: string) {
    const submission = await this.applicationSubmissionService.fetchSubmission(fileNumber);
    this.proposedLots = submission.subdProposedLots;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async saveALRArea(i: number, $event: string | null) {
    if (this.fileNumber) {
      this.proposedLots[i].alrArea = $event ? parseFloat($event) : null;
      await this.applicationSubmissionService.update(this.fileNumber, {
        subProposedLots: this.proposedLots,
      });
    }
  }
}
