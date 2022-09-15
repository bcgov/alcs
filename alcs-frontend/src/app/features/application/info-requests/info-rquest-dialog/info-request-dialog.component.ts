import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationMeetingTypeDto } from '../../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';
import { ApplicationMeetingDialogComponent } from '../../application-meeting/application-meeting-dialog/application-meeting-dialog.component';

export class ApplicationInfoRequestForm {
  constructor(
    public fileNumber: string,
    public startDate: Date,
    public endDate: Date | null = null,
    public meetingType: ApplicationMeetingTypeDto,
    public uuid: string | undefined = undefined,
    public reason: string | undefined = undefined,
    public reasonText: string | undefined = undefined
  ) {}
}

export const REASON_TYPE = {
  DEFAULT: 'Waiting for additional information from applicant',
  CUSTOM: 'custom',
};
@Component({
  selector: 'app-info-request-dialog',
  templateUrl: './info-request-dialog.component.html',
  styleUrls: ['./info-request-dialog.component.scss'],
})
export class InfoRequestDialogComponent {
  model: ApplicationInfoRequestForm;
  defaultReason = REASON_TYPE.DEFAULT;
  @ViewChild('customReasonText') customReasonText: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationInfoRequestForm,
    private dialogRef: MatDialogRef<ApplicationMeetingDialogComponent>,
    private meetingService: ApplicationMeetingService
  ) {
    if (data.uuid) {
      this.model = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        reason: data.reason,
        reasonText: data.reasonText,
      };
    } else {
      this.model = new ApplicationInfoRequestForm(
        data.fileNumber,
        new Date(),
        null,
        data.meetingType,
        undefined,
        REASON_TYPE.DEFAULT
      );
    }
  }

  async onSubmit() {
    if (this.model.uuid) {
      await this.meetingService.update(this.model.uuid, {
        startDate: this.model.startDate,
        endDate: this.model.endDate,
        description: this.getDescription(),
      });
    } else {
      await this.meetingService.create(this.model.fileNumber, {
        startDate: this.model.startDate,
        endDate: this.model.endDate,
        meetingTypeCode: this.data.meetingType.code,
        description: this.getDescription(),
      });
    }
    this.dialogRef.close(true);
  }

  startDateSelected() {
    if (this.model.startDate && this.model.endDate && this.model.startDate > this.model.endDate) {
      this.model.endDate = this.model.startDate;
    }
  }

  changeReason($event: any) {
    if ($event.value === REASON_TYPE.CUSTOM) {
      this.model.reason = REASON_TYPE.CUSTOM;
      setTimeout(() => this.customReasonText.nativeElement.focus(), 100);
    }

    if ($event.value === REASON_TYPE.DEFAULT) {
      this.model.reasonText = '';
    }
  }

  onReasonInputClick() {
    this.model.reason = REASON_TYPE.CUSTOM;
  }

  private getDescription() {
    return this.model.reason && this.model.reason !== REASON_TYPE.DEFAULT ? this.model.reasonText : this.model.reason;
  }
}
