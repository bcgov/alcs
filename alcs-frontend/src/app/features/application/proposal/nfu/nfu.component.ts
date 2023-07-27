import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../../services/application/application.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { NFU_SUBTYPES_OPTIONS, NFU_TYPES_OPTIONS } from './nfu.constants';

@Component({
  selector: 'app-proposal-nfu',
  templateUrl: './nfu.component.html',
  styleUrls: ['./nfu.component.scss'],
})
export class NfuProposalComponent implements OnDestroy, OnInit {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;

  nfuTypes = NFU_TYPES_OPTIONS;
  nfuSubTypes = NFU_SUBTYPES_OPTIONS;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
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
