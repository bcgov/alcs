import { Component, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit {
  fileNumber: string = '';
  decisionDate: number | undefined;

  constructor(private applicationDetailService: ApplicationDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.decisionDate = application.decisionDate;
      }
    });
  }

  async setDecisionDate(time: number) {
    await this.applicationDetailService.updateApplication({
      fileNumber: this.fileNumber,
      decisionDate: time,
    });
    this.toastService.showSuccessToast('Application updated');
  }
}
