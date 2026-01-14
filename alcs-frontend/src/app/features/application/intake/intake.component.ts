import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SYSTEM_SOURCE_TYPES } from '../../../shared/dto/system-source.types.dto';

@Component({
    selector: 'app-overview',
    templateUrl: './intake.component.html',
    styleUrls: ['./intake.component.scss'],
    standalone: false
})
export class IntakeComponent implements OnInit {
  $destroy = new Subject<void>();

  dateSubmittedToAlc?: string;
  application?: ApplicationDto;
  APPLICATION_SYSTEM_SOURCE_TYPES = SYSTEM_SOURCE_TYPES;
  regions: { label: string; value: string; disabled?: boolean | null }[] = [];

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.dateSubmittedToAlc = moment(application.dateSubmittedToAlc).format(environment.dateFormat);
        this.application = application;
      }
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions.map((region) => ({
        label: region.label,
        value: region.code,
      }));
    });
  }

  async updateApplicationDate(field: keyof UpdateApplicationDto, time: number) {
    const application = this.application;
    if (application) {
      const update = await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: time,
      });
      if (update) {
        this.toastService.showSuccessToast('Application updated');
      }
    }
  }

  async updateApplicationNumber(field: keyof UpdateApplicationDto, value: string | null) {
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

  async updateApplicationBoolean(field: keyof UpdateApplicationDto, value: boolean) {
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

  async updateApplicationRegion(regionCode: string | string[] | null) {
    if (regionCode && !Array.isArray(regionCode)) {
      const application = this.application;
      if (application) {
        const update = await this.applicationDetailService.updateApplication(application.fileNumber, {
          regionCode,
        });
        if (update) {
          this.toastService.showSuccessToast('Application updated');
        }
      }
    }
  }
}
