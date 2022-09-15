import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationMeetingTypeDto } from '../../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';

export class ApplicationMeetingForm {
  constructor(
    public fileNumber: string,
    public startDate: Date,
    public endDate: Date,
    public meetingType: ApplicationMeetingTypeDto,
    public uuid: string | undefined = undefined
  ) {}
}

@Component({
  selector: 'app-application-meeting-dialog',
  templateUrl: './application-meeting-dialog.component.html',
  styleUrls: ['./application-meeting-dialog.component.scss'],
})
export class ApplicationMeetingDialogComponent {
  model: ApplicationMeetingForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationMeetingForm,
    private dialogRef: MatDialogRef<ApplicationMeetingDialogComponent>,
    private meetingService: ApplicationMeetingService
  ) {
    if (data.uuid) {
      this.model = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
    } else {
      this.model = new ApplicationMeetingForm(data.fileNumber, new Date(), new Date(), data.meetingType);
    }
  }

  async onSubmit() {
    if (this.model) {
      if (this.model.uuid) {
        await this.meetingService.update(this.model.uuid, {
          startDate: this.model.startDate,
          endDate: this.model.endDate,
          description: '',
        });
      } else {
        await this.meetingService.create(this.data.fileNumber, {
          startDate: this.model.startDate,
          endDate: this.model.endDate,
          meetingTypeCode: this.data.meetingType.code,
          description: '',
        });
      }
      this.dialogRef.close();
    }
  }

  startDateSelected() {
    if (this.model.startDate && this.model.startDate > this.model.endDate) {
      this.model.endDate = this.model.startDate;
    }
  }
}
