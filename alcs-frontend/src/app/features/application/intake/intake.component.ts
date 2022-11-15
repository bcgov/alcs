import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
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

  async updateApplication(field: keyof UpdateApplicationDto, time: number) {
    const application = this.application;
    if (application) {
      await this.applicationDetailService.updateApplication(application.fileNumber, {
        [field]: time,
      });
      this.toastService.showSuccessToast('Application updated');
    }
  }
}
