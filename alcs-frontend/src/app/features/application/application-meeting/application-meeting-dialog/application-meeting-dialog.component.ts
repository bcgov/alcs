import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  isLoading = false;
  form;
  private uuid;
  meetingType: ApplicationMeetingTypeDto;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationMeetingForm,
    private dialogRef: MatDialogRef<ApplicationMeetingDialogComponent>,
    private meetingService: ApplicationMeetingService
  ) {
    this.uuid = data.uuid;
    this.meetingType = data.meetingType;
    this.form = new FormGroup({
      meetingStartDate: new FormControl<Date>(new Date(data.meetingStartDate), [Validators.required]),
      meetingEndDate: new FormControl<Date | undefined>(
        data.meetingEndDate ? new Date(data.meetingEndDate) : undefined,
        []
      ),
      reportStartDate: new FormControl<Date | undefined>(
        data.reportStartDate ? new Date(data.reportStartDate) : undefined,
        []
      ),
      reportEndDate: new FormControl<Date | undefined>(
        data.reportEndDate ? new Date(data.reportEndDate) : undefined,
        []
      ),
    });
  }

  onChange() {
    this.form.markAllAsTouched();
  }

  async onSubmit() {
    if (this.form && this.form.valid) {
      this.isLoading = true;
      try {
        const formValues = this.form.getRawValue();
        const data = {
          meetingStartDate: formValues.meetingStartDate!,
          meetingEndDate: formValues.meetingEndDate ? formValues.meetingEndDate : null,
          reportStartDate: formValues.reportStartDate ? formValues.reportStartDate : null,
          reportEndDate: formValues.reportEndDate ? formValues.reportEndDate : null,
          description: '',
        };
        await this.meetingService.update(this.uuid, this.meetingType.label, data);
      } finally {
        this.isLoading = false;
      }
      this.dialogRef.close(true);
    }
  }
}
