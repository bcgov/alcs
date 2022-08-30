import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationMeetingTypeDto } from '../../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';

export class ApplicationMeetingForm {
  constructor(
    public fileNumber: string,
    public startDate: Date,
    public endDate: Date,
    public meetingTypeCode: string,
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
      // TODO: accept type as input parameter
      this.model = new ApplicationMeetingForm(data.fileNumber, new Date(), new Date(), 'AM', data.meetingType);
    }
  }

  async onSubmit() {
    if (this.model) {
      if (this.model.uuid) {
        this.meetingService.update({
          uuid: this.model.uuid as string,
          startDate: this.model.startDate,
          endDate: this.model.endDate,
          applicationFileNumber: this.data.fileNumber,
          meetingTypeCode: this.data.meetingTypeCode,
        });
      } else {
        this.meetingService.create({
          startDate: this.model.startDate,
          endDate: this.model.endDate,
          applicationFileNumber: this.data.fileNumber,
          meetingTypeCode: this.data.meetingTypeCode,
        });
      }

      await this.meetingService.fetch(this.data.fileNumber);
      this.dialogRef.close();
    }
  }
}
