import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoticeOfIntentMeetingTypeDto } from '../../../../services/notice-of-intent/application-meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeetingService } from '../../../../services/notice-of-intent/application-meeting/notice-of-intent-meeting.service';

export type NoticeOfIntentMeetingForm = {
  fileNumber: string;
  meetingStartDate: Date;
  meetingEndDate: Date | null;
  reportStartDate: Date | null;
  reportEndDate: Date | null;
  meetingType: NoticeOfIntentMeetingTypeDto;
  uuid: string;
};

@Component({
  selector: 'app-notice-of-intent-meeting-dialog',
  templateUrl: './notice-of-intent-meeting-dialog.component.html',
  styleUrls: ['./notice-of-intent-meeting-dialog.component.scss'],
})
export class NoticeOfIntentMeetingDialogComponent {
  isLoading = false;
  form;
  private uuid;
  meetingType: NoticeOfIntentMeetingTypeDto;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NoticeOfIntentMeetingForm,
    private dialogRef: MatDialogRef<NoticeOfIntentMeetingDialogComponent>,
    private meetingService: NoticeOfIntentMeetingService
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
