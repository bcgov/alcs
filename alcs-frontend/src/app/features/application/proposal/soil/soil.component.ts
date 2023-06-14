import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import {
  ApplicationDto,
  ApplicationSubmissionDto,
  UpdateApplicationDto,
} from '../../../../services/application/application.dto';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-proposal-soil',
  templateUrl: './soil.component.html',
  styleUrls: ['./soil.component.scss'],
})
export class SoilProposalComponent implements OnDestroy, OnInit {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  submission: ApplicationSubmissionDto | undefined;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe(async (application) => {
      if (application) {
        this.application = application;
        this.submission = await this.applicationSubmissionService.fetchSubmission(application.fileNumber);
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
