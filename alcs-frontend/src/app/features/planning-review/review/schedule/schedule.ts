import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PlanningReviewDetailService } from '../../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewMeetingDto } from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.dto';
import { PlanningReviewMeetingService } from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { EditMeetingDialogComponent } from '../edit-meeting-dialog/edit-meeting-dialog.component';

@Component({
  selector: 'app-planning-review-schedule',
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class ScheduleComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  displayedColumns: string[] = ['date', 'type', 'action'];
  meetings: PlanningReviewMeetingDto[] = [];
  planningReviewUuid: string | undefined;
  fileNumber: string | undefined;

  constructor(
    public dialog: MatDialog,
    private decisionMeetingService: PlanningReviewMeetingService,
    private confirmationDialogService: ConfirmationDialogService,
    private planningReviewDetailService: PlanningReviewDetailService,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((planningReview) => {
      if (planningReview) {
        this.planningReviewUuid = planningReview.uuid;
        this.fileNumber = planningReview.fileNumber;
        this.meetings = planningReview.meetings;
      }
    });
  }

  async onCreate() {
    this.dialog
      .open(EditMeetingDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          planningReviewUuid: this.planningReviewUuid,
        },
      })
      .beforeClosed()
      .subscribe((didCreate) => {
        if (didCreate && this.fileNumber) {
          this.planningReviewDetailService.loadReview(this.fileNumber);
        }
      });
  }

  async onEdit(meeting: PlanningReviewMeetingDto) {
    this.dialog
      .open(EditMeetingDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          planningReviewUuid: this.planningReviewUuid,
          existingMeeting: meeting,
        },
      })
      .beforeClosed()
      .subscribe((didEdit) => {
        if (didEdit && this.fileNumber) {
          this.planningReviewDetailService.loadReview(this.fileNumber);
        }
      });
  }

  async onDelete(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete this meeting',
      })
      .subscribe((didConfirm) => {
        if (didConfirm) {
          this.decisionMeetingService.delete(uuid).then(() => {
            if (this.fileNumber) {
              this.planningReviewDetailService.loadReview(this.fileNumber);
            }
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
