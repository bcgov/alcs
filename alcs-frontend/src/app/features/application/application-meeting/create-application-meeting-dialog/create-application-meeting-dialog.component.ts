import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationMeetingTypeDto } from '../../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';

@Component({
  selector: 'app-application-meeting-dialog',
  templateUrl: './create-application-meeting-dialog.component.html',
  styleUrls: ['./create-application-meeting-dialog.component.scss'],
})
export class CreateApplicationMeetingDialogComponent {
  isLoading = false;
  startDate = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      meetingType: ApplicationMeetingTypeDto;
      fileNumber: string;
    },
    private dialogRef: MatDialogRef<CreateApplicationMeetingDialogComponent>,
    private meetingService: ApplicationMeetingService
  ) {}

  async onSubmit() {
    this.isLoading = true;
    try {
      const data = {
        meetingStartDate: this.startDate,
      };
      await this.meetingService.create(this.data.fileNumber, this.data.meetingType.label, {
        ...data,
        meetingTypeCode: this.data.meetingType.code,
      });
    } finally {
      this.isLoading = false;
    }
    this.dialogRef.close(true);
  }
}
