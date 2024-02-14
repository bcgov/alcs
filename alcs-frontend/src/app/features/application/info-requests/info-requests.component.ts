import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import {
  ApplicationMeetingDto,
  ApplicationMeetingTypeDto,
} from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { InfoRequestDialogComponent, REASON_TYPE } from './info-request-dialog/info-request-dialog.component';

@Component({
  selector: 'app-app-info-requests',
  templateUrl: './info-requests.component.html',
  styleUrls: ['./info-requests.component.scss'],
})
export class InfoRequestsComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  displayedColumns: string[] = ['startDate', 'endDate', 'description', 'action'];
  infoRequests: ApplicationMeetingDto[] = [];
  fileNumber: string = '';

  constructor(
    public dialog: MatDialog,
    private meetingService: ApplicationMeetingService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    private applicationDetailService: ApplicationDetailService,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.meetingService.fetch(application.fileNumber);
      }
    });

    this.meetingService.$meetings.pipe(takeUntil(this.destroy)).subscribe((meetings) => {
      this.infoRequests = meetings
        .filter((m) => m.meetingType.code === 'IR')
        .sort((a, b) => (a.meetingStartDate >= b.meetingStartDate ? -1 : 1));
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async onCreate(meetingType: ApplicationMeetingTypeDto) {
    const dialog = this.dialog.open(InfoRequestDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
        meetingType: { ...meetingType, reason: REASON_TYPE.DEFAULT },
      },
    });
    dialog.beforeClosed().subscribe((result) => {
      if (result) {
        this.applicationDetailService.loadApplication(this.fileNumber);
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
          startDate: meeting.meetingStartDate,
          endDate: meeting.meetingEndDate ?? null,
          meetingType: meeting.meetingType,
          reason:
            meeting.description === REASON_TYPE.DEFAULT || !meeting.description
              ? REASON_TYPE.DEFAULT
              : REASON_TYPE.CUSTOM,
          reasonText: meeting.description === REASON_TYPE.DEFAULT ? null : meeting.description,
        },
      });
      dialog.beforeClosed().subscribe((result) => {
        if (result) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
    } else {
      this.toastService.showErrorToast('Failed to open Information Request, please refresh the page');
    }
  }

  async onDelete(uuid: string) {
    const answer = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to delete Info Request?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.meetingService.delete(uuid, 'Information Request').then(() => {
          this.applicationDetailService.loadApplication(this.fileNumber);
        });
      }
    });
  }

  async onSaveEndDate(uuid: any, endDate: number) {
    const matchingMeeting = this.infoRequests.find((request) => request.uuid === uuid);
    if (matchingMeeting) {
      await this.meetingService.update(uuid, 'Information Request', {
        meetingStartDate: new Date(matchingMeeting.meetingStartDate),
        meetingEndDate: new Date(endDate),
        description: matchingMeeting.description,
      });
      await this.applicationDetailService.loadApplication(this.fileNumber);
    } else {
      this.toastService.showErrorToast('Failed to update meeting');
    }
  }
}
