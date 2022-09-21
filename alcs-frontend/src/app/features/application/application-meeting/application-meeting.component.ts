import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import {
  ApplicationMeetingDto,
  ApplicationMeetingTypeDto,
} from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ApplicationMeetingDialogComponent } from './application-meeting-dialog/application-meeting-dialog.component';

@Component({
  selector: 'app-application-meeting',
  templateUrl: './application-meeting.component.html',
  styleUrls: ['./application-meeting.component.scss'],
})
export class ApplicationMeetingComponent implements OnInit {
  displayedColumns: string[] = ['startDate', 'endDate', 'action'];
  siteVisits: ApplicationMeetingDto[] = [];
  applicantMeetings: ApplicationMeetingDto[] = [];
  fileNumber: string = '';

  constructor(
    public dialog: MatDialog,
    private meetingService: ApplicationMeetingService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    private applicationDetailService: ApplicationDetailService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.meetingService.fetch(this.fileNumber);
        this.meetingService.$meetings.subscribe((meetings) => {
          this.siteVisits = meetings
            .filter((m) => m.meetingType.code === 'SV')
            .sort((a, b) => (a.startDate >= b.startDate ? -1 : 1));

          this.applicantMeetings = meetings
            .filter((m) => m.meetingType.code === 'AM')
            .sort((a, b) => (a.startDate >= b.startDate ? -1 : 1));
        });
      }
    });
  }

  async onCreate(meetingType: ApplicationMeetingTypeDto) {
    const dialog = this.dialog.open(ApplicationMeetingDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
        meetingTypeCode: meetingType.code,
        meetingType: meetingType,
      },
    });
    dialog.beforeClosed().subscribe((result) => {
      if (result) {
        this.meetingService.fetch(this.fileNumber);
      }
    });
  }

  async onEdit(uuid: string) {
    const meeting = await this.meetingService.fetchOne(uuid);
    if (meeting) {
      const dialog = this.dialog.open(ApplicationMeetingDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileNumber: this.fileNumber,
          uuid: meeting.uuid,
          startDate: meeting.startDate,
          endDate: meeting.endDate,
          meetingTypeCode: meeting.meetingType.code,
          meetingType: meeting.meetingType,
          reason: meeting.description,
        },
      });
      dialog.beforeClosed().subscribe((result) => {
        if (result) {
          this.meetingService.fetch(this.fileNumber);
        }
      });
    } else {
      this.toastService.showErrorToast('Failed to open meeting, please refresh the page.');
    }
  }

  async onDelete(uuid: string) {
    const answer = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to delete meeting?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.meetingService.delete(uuid).then(() => {
          this.meetingService.fetch(this.fileNumber);
        });
      }
    });
  }
}
