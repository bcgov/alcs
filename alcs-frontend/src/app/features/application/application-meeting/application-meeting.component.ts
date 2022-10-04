import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import {
  ApplicationMeetingDto,
  ApplicationMeetingTypeDto,
  UpdateApplicationMeetingDto,
} from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ApplicationMeetingDialogComponent } from './application-meeting-dialog/application-meeting-dialog.component';
import { CreateApplicationMeetingDialogComponent } from './create-application-meeting-dialog/create-application-meeting-dialog.component';

@Component({
  selector: 'app-create-application-meeting',
  templateUrl: './application-meeting.component.html',
  styleUrls: ['./application-meeting.component.scss'],
})
export class ApplicationMeetingComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  displayedColumns: string[] = [
    'index',
    'meetingStartDate',
    'meetingEndDate',
    'reportStartDate',
    'reportEndDate',
    'action',
  ];
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
    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.meetingService.fetch(this.fileNumber);
        this.meetingService.$meetings.subscribe((meetings) => {
          this.siteVisits = meetings
            .filter((m) => m.meetingType.code === 'SV')
            .sort((a, b) => (a.meetingStartDate >= b.meetingStartDate ? -1 : 1));

          this.applicantMeetings = meetings
            .filter((m) => m.meetingType.code === 'AM')
            .sort((a, b) => (a.meetingStartDate >= b.meetingStartDate ? -1 : 1));
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async onCreate(meetingType: ApplicationMeetingTypeDto) {
    const dialog = this.dialog.open(CreateApplicationMeetingDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileNumber: this.fileNumber,
        meetingType: meetingType,
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
      const dialog = this.dialog.open(ApplicationMeetingDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileNumber: this.fileNumber,
          uuid: meeting.uuid,
          meetingStartDate: meeting.meetingStartDate,
          meetingEndDate: meeting.meetingEndDate,
          reportStartDate: meeting.reportStartDate,
          reportEndDate: meeting.reportEndDate,
          meetingTypeCode: meeting.meetingType.code,
          meetingType: meeting.meetingType,
          reason: meeting.description,
        },
      });
      dialog.beforeClosed().subscribe((result) => {
        if (result) {
          this.applicationDetailService.loadApplication(this.fileNumber);
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
          this.applicationDetailService.loadApplication(this.fileNumber);
        });
      }
    });
  }

  async onSaveMeetingEndDate(uuid: any, meetingEndDate: number) {
    await this.updateMeeting(uuid, {
      meetingEndDate: new Date(meetingEndDate),
    });
  }

  async onSaveReportStartDate(uuid: any, reportStartDate: number) {
    await this.updateMeeting(uuid, {
      reportStartDate: new Date(reportStartDate),
    });
  }

  async onSaveReportEndDate(uuid: any, reportEndDate: number) {
    await this.updateMeeting(uuid, {
      reportEndDate: new Date(reportEndDate),
    });
  }

  async updateMeeting(uuid: any, updates: UpdateApplicationMeetingDto) {
    await this.meetingService.update(uuid, updates);
    await this.applicationDetailService.loadApplication(this.fileNumber);
  }
}
