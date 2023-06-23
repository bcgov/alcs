import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';

interface InlineSelect {
  label: string;
  value: string;
}

@Component({
  selector: 'app-proposal-naru',
  templateUrl: './naru.component.html',
  styleUrls: ['./naru.component.scss'],
})
export class NaruProposalComponent implements OnDestroy, OnInit {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  naruSubtype: string = '';

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private toastService: ToastService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private decisionService: ApplicationDecisionV2Service
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
        this.applicationSubmissionService
          .fetchSubmission(application.fileNumber)
          .then((e) => (this.naruSubtype = e.naruSubtype?.label ?? ''));
      }
    });
  }

  async updateApplicationValue(field: keyof UpdateApplicationDto, value: string[] | string | number | null) {
    const application = this.application;
    if (application) {
      const update = await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Application updated');
      }
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
