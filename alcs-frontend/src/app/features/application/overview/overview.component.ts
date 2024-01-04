import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationSubmissionToSubmissionStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';
import { ApplicationTimelineService } from '../../../services/application/application-timeline/application-timeline.service';
import { ApplicationDto, SUBMISSION_STATUS } from '../../../services/application/application.dto';
import { TimelineEventDto } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { UncancelApplicationDialogComponent } from './uncancel-application-dialog/uncancel-application-dialog.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application?: ApplicationDto;
  events: TimelineEventDto[] = [];
  summary = '';
  isCancelled = false;
  isHiddenFromPortal = false;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private applicationTimelineService: ApplicationTimelineService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe(async (application) => {
      if (application) {
        this.application = application;
        this.summary = application.summary ?? '';
        this.events = await this.applicationTimelineService.fetchByFileNumber(application.fileNumber);
        this.loadStatusHistory(this.application.fileNumber);
        this.isHiddenFromPortal = application.hideFromPortal;
      }
    });
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onCancelApplication() {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to cancel this Application?`,
        cancelButtonText: 'No',
        title: 'Cancel Application',
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm && this.application) {
          await this.applicationDetailService.cancelApplication(this.application.fileNumber);
          await this.loadStatusHistory(this.application.fileNumber);
        }
      });
  }

  async onUncancelApplication() {
    if (this.application) {
      this.dialog
        .open(UncancelApplicationDialogComponent, {
          data: {
            fileNumber: this.application.fileNumber,
          },
        })
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm && this.application) {
            await this.applicationDetailService.uncancelApplication(this.application.fileNumber);
            await this.loadStatusHistory(this.application.fileNumber);
          }
        });
    }
  }

  async onSaveSummary(updatedSummary: string) {
    if (this.application) {
      await this.applicationDetailService.updateApplication(this.application.fileNumber, {
        summary: updatedSummary ?? null,
      });
    }
  }

  private async loadStatusHistory(fileNumber: string) {
    let statusHistory: ApplicationSubmissionToSubmissionStatusDto[] = [];
    try {
      statusHistory = await this.applicationSubmissionStatusService.fetchSubmissionStatusesByFileNumber(
        fileNumber,
        false,
      );
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    this.isCancelled =
      statusHistory.filter((status) => status.effectiveDate && status.statusTypeCode === SUBMISSION_STATUS.CANCELLED)
        .length > 0;
  }

  onTogglePortalVisible() {
    if (this.isHiddenFromPortal) {
      this.confirmationDialogService
        .openDialog({
          body: 'Are you sure you want to remove the access restriction for the L/FNG and public? If you continue, this File ID could return search results for the L/FNG and the public. Standard rules for showing/hiding content will apply.',
        })
        .subscribe((didConfirm) => {
          this.isHiddenFromPortal = didConfirm;
          if (didConfirm && this.application) {
            this.applicationDetailService.updateApplication(this.application.fileNumber, {
              hideFromPortal: true,
            });
          }
        });
    } else {
      this.confirmationDialogService
        .openDialog({
          body: 'If you continue, this File ID will not return any search results for the L/FNG and the public. Please add a journal note to explain why this file is restricted.',
        })
        .subscribe((didConfirm) => {
          this.isHiddenFromPortal = !didConfirm;
          if (didConfirm && this.application) {
            this.applicationDetailService.updateApplication(this.application.fileNumber, {
              hideFromPortal: false,
            });
          }
        });
    }
  }
}
