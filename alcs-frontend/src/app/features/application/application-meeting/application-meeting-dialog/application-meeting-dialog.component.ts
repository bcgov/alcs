import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationMeetingTypeDto } from '../../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';

export class ApplicationMeetingForm {
  constructor(
    public fileNumber: string,
    public startDate: Date,
    public endDate: Date | null,
    public meetingType: ApplicationMeetingTypeDto,
    public uuid: string | undefined = undefined,
    public reason: string | undefined = undefined
  ) {}
}

const SITE_VISIT_REASONS = {
  MEETING: 'Waiting for a scheduled site visit to occur',
  REPORT: 'Waiting for applicant to review site visit report',
};

const APPLICANT_MEETING = {
  MEETING: 'Waiting for a scheduled applicant / exclusion meeting to occur',
  REPORT: 'Waiting for applicant to review meeting report',
};
@Component({
  selector: 'app-application-meeting-dialog',
  templateUrl: './application-meeting-dialog.component.html',
  styleUrls: ['./application-meeting-dialog.component.scss'],
})
export class ApplicationMeetingDialogComponent {
  model: ApplicationMeetingForm;

  reasons: any = {
    meeting: '',
    report: '',
  };

  siteVisitReason: string = 'Waiting for a scheduled site visit to occur';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationMeetingForm,
    private dialogRef: MatDialogRef<ApplicationMeetingDialogComponent>,
    private meetingService: ApplicationMeetingService
  ) {
    if (data.uuid) {
      this.model = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      };
    } else {
      this.model = new ApplicationMeetingForm(data.fileNumber, new Date(), null, data.meetingType);
    }

    this.populateReasonsOptions(data);
  }

  private populateReasonsOptions(data: ApplicationMeetingForm) {
    if (data.meetingType.code === 'SV') {
      this.reasons = {
        meeting: SITE_VISIT_REASONS.MEETING,
        report: SITE_VISIT_REASONS.REPORT,
      };
    }

    if (data.meetingType.code === 'AM') {
      this.reasons = {
        meeting: APPLICANT_MEETING.MEETING,
        report: APPLICANT_MEETING.REPORT,
      };
    }
  }

  async onSubmit() {
    if (this.model) {
      const data = {
        startDate: this.model.startDate,
        endDate: this.model.endDate,
        description: this.model.reason,
      };
      if (this.model.uuid) {
        await this.meetingService.update(this.model.uuid, data);
      } else {
        await this.meetingService.create(this.data.fileNumber, {
          ...data,
          meetingTypeCode: this.data.meetingType.code,
        });
      }
      this.dialogRef.close(true);
    }
  }

  startDateSelected() {
    if (this.model.startDate && this.model.endDate && this.model.startDate > this.model.endDate) {
      this.model.endDate = this.model.startDate;
    }
  }
}
