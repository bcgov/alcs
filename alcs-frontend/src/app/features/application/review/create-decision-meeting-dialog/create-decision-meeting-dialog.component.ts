import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';

export class ApplicationDecisionMeetingForm {
  constructor(public fileNumber: string, public date: Date, public uuid: string | undefined = undefined) {}
}

@Component({
  selector: 'app-create-decision-meeting-dialog',
  templateUrl: './create-decision-meeting-dialog.component.html',
  styleUrls: ['./create-decision-meeting-dialog.component.scss'],
})
export class CreateDecisionMeetingDialogComponent implements OnInit {
  model: ApplicationDecisionMeetingForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDecisionMeetingForm,
    private dialogRef: MatDialogRef<CreateDecisionMeetingDialogComponent>,
    public decisionMeetingService: ApplicationDecisionMeetingService
  ) {
    if (data.uuid) {
      // fetch meeting for edit
      this.model = {
        ...data,
        date: new Date(data.date),
      };
    } else {
      this.model = new ApplicationDecisionMeetingForm(data.fileNumber, new Date());
    }
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.model) {
      if (this.model.uuid) {
        this.decisionMeetingService.update({
          uuid: this.model.uuid as string,
          date: this.model.date,
          applicationFileNumber: this.data.fileNumber,
        });
      } else {
        this.decisionMeetingService.create({
          date: this.model.date,
          applicationFileNumber: this.data.fileNumber,
        });
      }

      await this.decisionMeetingService.fetch(this.data.fileNumber);
      this.dialogRef.close();
    }
  }
}
