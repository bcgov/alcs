import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDetailedDto, ApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-overview',
  templateUrl: './intake.component.html',
  styleUrls: ['./intake.component.scss'],
})
export class IntakeComponent implements OnInit {
  dateReceived?: string;
  application?: ApplicationDetailedDto;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.dateReceived = moment(application.dateReceived).format(environment.dateFormat);
        this.application = application;
      }
    });
  }

  async updateApplication(field: keyof ApplicationDto, time: number) {
    const application = this.application;
    if (application) {
      await this.applicationDetailService.updateApplication({
        fileNumber: application.fileNumber,
        [field]: time,
      });
      this.toastService.showSuccessToast('Application updated');
    }
  }
}
