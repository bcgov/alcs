import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
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
    this.dateReceived = dayjs(this.application?.dateReceived).format('YYYY-MMM-DD');
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
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
