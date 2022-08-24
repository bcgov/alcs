import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDecisionMeetingDto } from '../../../../services/application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CreateDecisionMeetingDialogComponent } from '../create-decision-meeting-dialog/create-decision-meeting-dialog.component';

@Component({
  selector: 'app-decision-meeting',
  templateUrl: './decision-meeting.component.html',
  styleUrls: ['./decision-meeting.component.scss'],
})
export class DecisionMeetingComponent implements OnInit {
  displayedColumns: string[] = ['date', 'action'];
  decisionMeetings: ApplicationDecisionMeetingDto[] = [];

  @Input()
  fileNumber: string = '';

  constructor(
    public dialog: MatDialog,
    public decisionMeetingService: ApplicationDecisionMeetingService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.decisionMeetingService.fetch(this.fileNumber);
    this.decisionMeetingService.$decisionMeetings.subscribe(
      (meetings) => (this.decisionMeetings = meetings.sort((a, b) => (a.date >= b.date ? -1 : 1)))
    );
  }

  async onCreate() {
    this.dialog.open(CreateDecisionMeetingDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
      },
    });
  }

  async onEdit(uuid: string) {
    const meeting = await this.decisionMeetingService.fetchOne(uuid);
    this.dialog.open(CreateDecisionMeetingDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
        uuid: meeting.uuid,
        date: meeting.date,
      },
    });
  }

  async onDelete(uuid: string) {
    const answer = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to delete meeting?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.decisionMeetingService.delete(uuid).then(() => {
          this.decisionMeetingService.fetch(this.fileNumber);
        });
      }
    });
  }
}
