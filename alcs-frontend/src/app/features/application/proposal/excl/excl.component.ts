import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDto, UpdateApplicationDto } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-proposal-excl',
  templateUrl: './excl.component.html',
  styleUrls: ['./excl.component.scss'],
})
export class ExclProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  applicantType: string | undefined;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
        this.applicantType = application.inclExclApplicantType;
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
