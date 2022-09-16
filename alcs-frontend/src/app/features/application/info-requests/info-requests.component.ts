import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationMeetingDto } from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { InfoRequestDialogComponent, REASON_TYPE } from './info-rquest-dialog/info-request-dialog.component';

@Component({
  selector: 'app-info-requests',
  templateUrl: './info-requests.component.html',
  styleUrls: ['./info-requests.component.scss'],
})
export class InfoRequestsComponent implements OnInit {
  displayedColumns: string[] = ['startDate', 'endDate', 'description', 'action'];
  infoRequests: ApplicationMeetingDto[] = [];
  fileNumber: string = '';
  dateFormat = environment.dateFormat;

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
      }
    });

    this.meetingService.$meetings.subscribe((meetings) => {
      this.infoRequests = meetings
        .filter((m) => m.meetingType.code === 'IR')
        .sort((a, b) => (a.startDate >= b.startDate ? -1 : 1));
    });
  }

  async onCreate(meetingTypeCode: string) {
    const dialog = this.dialog.open(InfoRequestDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
        meetingType: { code: meetingTypeCode, reason: REASON_TYPE.DEFAULT },
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
      const dialog = this.dialog.open(InfoRequestDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileNumber: this.fileNumber,
          uuid: meeting.uuid,
          startDate: meeting.startDate,
          endDate: meeting.endDate ?? null,
          meetingType: { code: meeting.meetingType.code },
          reason:
            meeting.description === REASON_TYPE.DEFAULT || !meeting.description
              ? REASON_TYPE.DEFAULT
              : REASON_TYPE.CUSTOM,
          reasonText: meeting.description === REASON_TYPE.DEFAULT ? null : meeting.description,
        },
      });
      dialog.beforeClosed().subscribe((result) => {
        if (result) {
          this.meetingService.fetch(this.fileNumber);
        }
      });
    } else {
      this.toastService.showErrorToast('Failed to open Info Request, please refresh the page.');
    }
  }

  async onDelete(uuid: string) {
    const answer = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to delete Info Request?',
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
