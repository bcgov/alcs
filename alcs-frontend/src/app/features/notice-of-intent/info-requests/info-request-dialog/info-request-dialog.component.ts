import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoticeOfIntentMeetingTypeDto } from '../../../../services/notice-of-intent/meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeetingService } from '../../../../services/notice-of-intent/meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentMeetingDialogComponent } from '../notice-of-intent-meeting-dialog/notice-of-intent-meeting-dialog.component';

export class NoticeOfIntentInfoRequestForm {
  constructor(
    public noticeOfIntentUuid: string,
    public startDate: Date,
    public endDate: Date | null = null,
    public meetingType: NoticeOfIntentMeetingTypeDto,
    public uuid: string | undefined = undefined,
    public reason: string | undefined = undefined,
    public reasonText: string | undefined = undefined,
  ) {}
}

export const REASON_TYPE = {
  DEFAULT: 'Waiting for additional information from applicant',
  CUSTOM: 'custom',
};

@Component({
  selector: 'app-noi-info-request-dialog',
  templateUrl: './info-request-dialog.component.html',
  styleUrls: ['./info-request-dialog.component.scss'],
})
export class InfoRequestDialogComponent {
  model: NoticeOfIntentInfoRequestForm;
  @ViewChild('customReasonText') customReasonText: any;
  isLoading = false;
  REASON_TYPE = REASON_TYPE;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NoticeOfIntentInfoRequestForm,
    private dialogRef: MatDialogRef<NoticeOfIntentMeetingDialogComponent>,
    private meetingService: NoticeOfIntentMeetingService,
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
      this.model = new NoticeOfIntentInfoRequestForm(
        data.noticeOfIntentUuid,
        new Date(),
        null,
        data.meetingType,
        undefined,
        REASON_TYPE.DEFAULT,
      );
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      if (this.model.uuid) {
        await this.meetingService.update(this.model.uuid, this.data.meetingType.label, {
          meetingStartDate: this.model.startDate,
          meetingEndDate: this.model.endDate,
          description: this.getDescription(),
        });
      } else {
        await this.meetingService.create(this.model.noticeOfIntentUuid, this.data.meetingType.label, {
          meetingStartDate: this.model.startDate,
          meetingEndDate: this.model.endDate || undefined,
          meetingTypeCode: this.data.meetingType.code,
          description: this.getDescription(),
        });
      }
    } finally {
      this.isLoading = false;
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
      this.customReasonText.nativeElement.blur();
    }
  }

  onReasonInputClick() {
    this.model.reason = REASON_TYPE.CUSTOM;
  }

  private getDescription() {
    return this.model.reason && this.model.reason !== REASON_TYPE.DEFAULT ? this.model.reasonText : this.model.reason;
  }
}
