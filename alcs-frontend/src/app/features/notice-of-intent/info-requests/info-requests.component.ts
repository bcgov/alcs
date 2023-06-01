import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import {
  NoticeOfIntentMeetingDto,
  NoticeOfIntentMeetingTypeDto,
} from '../../../services/notice-of-intent/application-meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeetingService } from '../../../services/notice-of-intent/application-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { InfoRequestDialogComponent, REASON_TYPE } from './info-request-dialog/info-request-dialog.component';

@Component({
  selector: 'app-info-requests',
  templateUrl: './info-requests.component.html',
  styleUrls: ['./info-requests.component.scss'],
})
export class InfoRequestsComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  displayedColumns: string[] = ['startDate', 'endDate', 'description', 'action'];
  infoRequests: NoticeOfIntentMeetingDto[] = [];
  fileNumber: string = '';
  uuid: string = '';

  constructor(
    public dialog: MatDialog,
    private meetingService: NoticeOfIntentMeetingService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    private noiDetailService: NoticeOfIntentDetailService
  ) {}

  ngOnInit(): void {
    this.noiDetailService.$noticeOfIntent.pipe(takeUntil(this.destroy)).subscribe((noi) => {
      if (noi) {
        this.fileNumber = noi.fileNumber;
        this.uuid = noi.uuid;
        this.meetingService.fetch(noi.uuid);
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

  async onCreate(meetingType: NoticeOfIntentMeetingTypeDto) {
    const dialog = this.dialog.open(InfoRequestDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
        noticeOfIntentUuid: this.uuid,
        meetingType: { ...meetingType, reason: REASON_TYPE.DEFAULT },
      },
    });
    dialog.beforeClosed().subscribe((result) => {
      if (result) {
        this.noiDetailService.load(this.fileNumber);
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
          this.noiDetailService.load(this.fileNumber);
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
          this.noiDetailService.load(this.fileNumber);
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
      await this.noiDetailService.load(this.fileNumber);
    } else {
      this.toastService.showErrorToast('Failed to update meeting');
    }
  }
}
