import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationMeetingTypeDto } from '../../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';

export type ApplicationMeetingForm = {
  fileNumber: string;
  meetingStartDate: Date;
  meetingEndDate: Date | null;
  reportStartDate: Date | null;
  reportEndDate: Date | null;
  meetingType: ApplicationMeetingTypeDto;
  uuid: string;
};

@Component({
  selector: 'app-application-meeting-dialog',
  templateUrl: './application-meeting-dialog.component.html',
  styleUrls: ['./application-meeting-dialog.component.scss'],
})
export class ApplicationMeetingDialogComponent {
  model: ApplicationMeetingForm;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationMeetingForm,
    private dialogRef: MatDialogRef<ApplicationMeetingDialogComponent>,
    private meetingService: ApplicationMeetingService
  ) {
    this.model = {
      ...data,
      meetingStartDate: new Date(data.meetingStartDate),
      meetingEndDate: data.meetingEndDate ? new Date(data.meetingEndDate) : null,
      reportStartDate: data.reportStartDate ? new Date(data.reportStartDate) : null,
      reportEndDate: data.reportEndDate ? new Date(data.reportEndDate) : null,
    };
  }

  async onSubmit() {
    if (this.model) {
      this.isLoading = true;
      try {
        const data = {
          meetingStartDate: this.model.meetingStartDate,
          meetingEndDate: this.model.meetingEndDate ? this.model.meetingEndDate : null,
          reportStartDate: this.model.reportStartDate ? this.model.reportStartDate : null,
          reportEndDate: this.model.reportEndDate ? this.model.reportEndDate : null,
          description: '',
        };
        if (this.model.uuid) {
          await this.meetingService.update(this.model.uuid, data);
        } else {
          await this.meetingService.create(this.data.fileNumber, this.data.meetingType.label, {
            ...data,
            meetingTypeCode: this.data.meetingType.code,
          });
        }
      } finally {
        this.isLoading = false;
      }
      this.dialogRef.close(true);
    }
  }
}
