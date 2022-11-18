import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDecisionMeetingDto } from '../../../../services/application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionMeetingDialogComponent } from '../decision-meeting-dialog/decision-meeting-dialog.component';

@Component({
  selector: 'app-decision-meeting',
  templateUrl: './decision-meeting.component.html',
  styleUrls: ['./decision-meeting.component.scss'],
})
export class DecisionMeetingComponent implements OnInit {
  displayedColumns: string[] = ['date', 'action'];
  decisionMeetings: ApplicationDecisionMeetingDto[] = [];

  _fileNumber: string = '';
  @Input() set fileNumber(fileNumber: string) {
    this._fileNumber = fileNumber;
    if (fileNumber) {
      this.decisionMeetingService.fetch(this._fileNumber);
    }
  }

  constructor(
    public dialog: MatDialog,
    private decisionMeetingService: ApplicationDecisionMeetingService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationDetailService: ApplicationDetailService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.decisionMeetingService.$decisionMeetings.subscribe(
      (meetings) => (this.decisionMeetings = meetings.sort((a, b) => (a.date >= b.date ? -1 : 1)))
    );
  }

  async onCreate() {
    this.dialog.open(DecisionMeetingDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this._fileNumber,
      },
    });
  }

  async onEdit(uuid: string) {
    const meeting = await this.decisionMeetingService.fetchOne(uuid);
    if (meeting) {
      this.dialog.open(DecisionMeetingDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileNumber: this._fileNumber,
          uuid: meeting.uuid,
          date: meeting.date,
        },
      });
    } else {
      this.toastService.showErrorToast('Failed to open discussion, please refresh the page');
    }
  }

  async onDelete(uuid: string) {
    const answer = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to delete discussion?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.decisionMeetingService.delete(uuid).then(() => {
          this.decisionMeetingService.fetch(this._fileNumber);
          this.applicationDetailService.loadApplication(this._fileNumber);
        });
      }
    });
  }
}
