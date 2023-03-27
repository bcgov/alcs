import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-overview',
  templateUrl: './intake.component.html',
  styleUrls: ['./intake.component.scss'],
})
export class IntakeComponent implements OnInit {
  dateSubmittedToAlc?: string;
  application?: ApplicationDto;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.dateSubmittedToAlc = moment(application.dateSubmittedToAlc).format(environment.dateFormat);
        this.application = application;
      }
    });
  }

  async updateApplicationDate(field: keyof UpdateApplicationDto, time: number) {
    const application = this.application;
    if (application) {
      await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: time,
      });
      this.toastService.showSuccessToast('Application updated');
    }
  }

  async updateApplicationNumber(field: keyof UpdateApplicationDto, value: string | null) {
    const application = this.application;
    if (application) {
      await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: value,
      });
      this.toastService.showSuccessToast('Application updated');
    }
  }

  async updateApplicationBoolean(field: keyof UpdateApplicationDto, value: boolean) {
    const application = this.application;
    if (application) {
      await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: value,
      });
      this.toastService.showSuccessToast('Application updated');
    }
  }
}
