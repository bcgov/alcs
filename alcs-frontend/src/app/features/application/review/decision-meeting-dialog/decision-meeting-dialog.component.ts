import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';

export class ApplicationDecisionMeetingForm {
  constructor(
    public fileNumber: string,
    public date: Date,
    public uuid: string | undefined = undefined,
  ) {}
}

@Component({
  selector: 'app-decision-meeting-dialog',
  templateUrl: './decision-meeting-dialog.component.html',
  styleUrls: ['./decision-meeting-dialog.component.scss'],
})
export class DecisionMeetingDialogComponent {
  model: ApplicationDecisionMeetingForm;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDecisionMeetingForm,
    private dialogRef: MatDialogRef<DecisionMeetingDialogComponent>,
    private decisionMeetingService: ApplicationDecisionMeetingService,
    private applicationDetailService: ApplicationDetailService,
    private toastService: ToastService,
  ) {
    if (data.uuid) {
      this.model = {
        ...data,
        date: new Date(data.date),
      };
    } else {
      this.model = new ApplicationDecisionMeetingForm(data.fileNumber, new Date());
    }
  }

  async onSubmit() {
    if (this.model) {
      let successMessage = 'Discussion';
      try {
        this.isLoading = true;
        if (this.model.uuid) {
          await this.decisionMeetingService.update({
            uuid: this.model.uuid as string,
            date: this.model.date,
            applicationFileNumber: this.data.fileNumber,
          });
          successMessage += ' updated';
        } else {
          await this.decisionMeetingService.create({
            date: this.model.date,
            applicationFileNumber: this.data.fileNumber,
          });
          successMessage += ' created';
        }

        await this.decisionMeetingService.fetch(this.data.fileNumber);
        this.applicationDetailService.loadApplication(this.data.fileNumber);
        this.dialogRef.close();
        this.toastService.showSuccessToast(successMessage);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
