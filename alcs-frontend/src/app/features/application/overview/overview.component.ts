import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatestWith, Subject, takeUntil, tap } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationMeetingDto } from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ApplicationModificationDto } from '../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationReviewService } from '../../../services/application/application-review/application-review.service';
import { ApplicationSubmissionToSubmissionStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';
import { ApplicationDto, ApplicationReviewDto, SUBMISSION_STATUS } from '../../../services/application/application.dto';
import { ApplicationDecisionDto } from '../../../services/application/decision/application-decision-v1/application-decision.dto';
import { ApplicationDecisionService } from '../../../services/application/decision/application-decision-v1/application-decision.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { TimelineEvent } from '../../../shared/timeline/timeline.component';
import { UncancelApplicationDialogComponent } from './uncancel-application-dialog/uncancel-application-dialog.component';

const editLink = new Map<string, string>([
  ['IR', './info-request'],
  ['AM', './site-visit-meeting'],
  ['SV', './site-visit-meeting'],
]);

const SORTING_ORDER = {
  //high comes first, 1 shows at bottom
  MODIFICATION_REVIEW: 13,
  MODIFICATION_REQUEST: 12,
  RECON_REVIEW: 11,
  RECON_REQUEST: 10,
  CHAIR_REVIEW_DECISION: 9,
  AUDITED_DECISION: 8,
  DECISION_MADE: 7,
  VISIT_REPORTS: 6,
  VISIT_REQUESTS: 5,
  ACKNOWLEDGE_COMPLETE: 4,
  FEE_RECEIVED: 3,
  ACKNOWLEDGED_INCOMPLETE: 2,
  SUBMITTED: 1,
};

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application?: ApplicationDto;
  private $decisions = new BehaviorSubject<ApplicationDecisionDto[]>([]);
  private $statusHistory = new BehaviorSubject<ApplicationSubmissionToSubmissionStatusDto[]>([]);
  events: TimelineEvent[] = [];
  summary = '';
  isCancelled = false;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private meetingService: ApplicationMeetingService,
    private decisionService: ApplicationDecisionService,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    private reviewService: ApplicationReviewService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application
      .pipe(takeUntil(this.$destroy))
      .pipe(
        tap((app) => {
          if (app) {
            this.clearComponentData();

            this.loadStatusHistory(app.fileNumber);
            this.meetingService.fetch(app.fileNumber);
            this.decisionService.fetchByApplication(app.fileNumber).then((res) => {
              this.$decisions.next(res);
            });
          }
        })
      )
      .pipe(
        combineLatestWith(
          this.meetingService.$meetings,
          this.$decisions,
          this.reconsiderationService.$reconsiderations,
          this.modificationService.$modifications,
          this.$statusHistory
        )
      )
      .subscribe(([application, meetings, decisions, reconsiderations, modifications, statusHistory]) => {
        if (application) {
          this.summary = application.summary || '';
          this.application = application;

          this.events = this.mapApplicationToEvents(
            application,
            meetings,
            decisions,
            reconsiderations,
            modifications,
            statusHistory
          );
        }
      });
  }

  async ngOnDestroy() {
    await this.clearComponentData();

    this.$destroy.next();
    this.$destroy.complete();
  }

  private async clearComponentData() {
    this.$decisions.next([]);
    this.$statusHistory.next([]);
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

  private mapApplicationToEvents(
    application: ApplicationDto,
    meetings: ApplicationMeetingDto[],
    decisions: ApplicationDecisionDto[],
    reconsiderations: ApplicationReconsiderationDto[],
    modifications: ApplicationModificationDto[],
    statusHistory: ApplicationSubmissionToSubmissionStatusDto[]
  ): TimelineEvent[] {
    const mappedEvents: TimelineEvent[] = [];

    const statusesToInclude = statusHistory.filter(
      (status) => ![SUBMISSION_STATUS.IN_REVIEW_BY_ALC].includes(status.status.code)
    );
    for (const status of statusesToInclude) {
      if (status.effectiveDate) {
        let htmlText = `<strong>${status.status.label}</strong>`;

        if (status.status.code === SUBMISSION_STATUS.RECEIVED_BY_ALC) {
          htmlText = 'Received All Items - <strong>Received by ALC</strong>';
        }

        if (status.status.code === SUBMISSION_STATUS.IN_PROGRESS) {
          htmlText = 'Created - <strong>In Progress</strong>';
        }

        if (status.status.code === SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE) {
          htmlText = 'Acknowledge Incomplete - <strong>Submitted to ALC - Incomplete</strong>';
        }

        mappedEvents.push({
          htmlText,
          startDate: new Date(status.effectiveDate + status.status.weight),
          isFulfilled: true,
        });
      }
    }

    if (application.dateAcknowledgedComplete) {
      mappedEvents.push({
        htmlText: 'Acknowledged Complete',
        startDate: new Date(application.dateAcknowledgedComplete + SORTING_ORDER.ACKNOWLEDGE_COMPLETE),
        isFulfilled: true,
      });
    }

    if (application.feePaidDate) {
      mappedEvents.push({
        htmlText: 'Fee Received Date',
        startDate: new Date(application.feePaidDate + SORTING_ORDER.FEE_RECEIVED),
        isFulfilled: true,
      });
    }

    const events: TimelineEvent[] = application.decisionMeetings
      .sort((a, b) => a.date - b.date)
      .map((meeting, index) => {
        let htmlText = `Review Discussion #${index + 1}`;
        if (index === 0) {
          htmlText += ` - <strong>Under Review by ALC</strong>`;
        }

        return {
          htmlText,
          startDate: new Date(meeting.date),
          isFulfilled: true,
        };
      });
    mappedEvents.push(...events);

    for (const [index, decision] of decisions.entries()) {
      if (decision.isDraft) {
        continue;
      }

      if (decision.auditDate) {
        mappedEvents.push({
          htmlText: `Audited Decision #${decisions.length - index}`,
          startDate: new Date(decision.auditDate + SORTING_ORDER.AUDITED_DECISION),
          isFulfilled: true,
        });
      }

      if (decision.chairReviewDate) {
        mappedEvents.push({
          htmlText: `Chair Reviewed Decision #${decisions.length - index}`,
          startDate: new Date(decision.chairReviewDate + SORTING_ORDER.CHAIR_REVIEW_DECISION),
          isFulfilled: true,
        });
      }

      mappedEvents.push({
        htmlText: `Decision #${decisions.length - index} Made${
          decisions.length - 1 === index ? ` - Active Days: ${application.activeDays}` : ''
        }`,
        startDate: new Date(decision.date + SORTING_ORDER.DECISION_MADE),
        isFulfilled: true,
      });
    }

    if (application.notificationSentDate) {
      mappedEvents.push({
        htmlText: "'Ready for Review' Notification Sent to Applicant",
        startDate: new Date(application.notificationSentDate),
        isFulfilled: true,
      });
    }

    meetings.sort((a, b) => a.meetingStartDate - b.meetingStartDate);
    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.meetingType.code) || 0;

      mappedEvents.push({
        htmlText: `${meeting.meetingType.label} #${count + 1}`,
        startDate: new Date(meeting.meetingStartDate + SORTING_ORDER.VISIT_REQUESTS),
        fulfilledDate: meeting.meetingEndDate ? new Date(meeting.meetingEndDate) : undefined,
        isFulfilled: !!meeting.meetingEndDate,
        link: editLink.get(meeting.meetingType.code),
      });

      if (meeting.reportStartDate) {
        mappedEvents.push({
          htmlText: `${meeting.meetingType.label} #${count + 1} Report Sent to Applicant`,
          startDate: new Date(meeting.reportStartDate + SORTING_ORDER.VISIT_REPORTS),
          fulfilledDate: meeting.reportEndDate ? new Date(meeting.reportEndDate) : undefined,
          isFulfilled: !!meeting.reportEndDate,
          link: editLink.get(meeting.meetingType.code),
        });
      }

      typeCount.set(meeting.meetingType.code, count + 1);
    });

    const mappedReconsiderations = this.mapReconsiderationsToEvents(reconsiderations);
    mappedEvents.push(...mappedReconsiderations);

    const mappedModifications = this.mapModificationsToEvents(modifications);
    mappedEvents.push(...mappedModifications);

    mappedEvents.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    return mappedEvents;
  }

  private mapReconsiderationsToEvents(reconsiderations: ApplicationReconsiderationDto[]) {
    const events: TimelineEvent[] = [];
    for (const [index, reconsideration] of reconsiderations
      .sort((a, b) => b.submittedDate - a.submittedDate)
      .entries()) {
      if (reconsideration.type.code === '33.1') {
        events.push({
          htmlText: `Reconsideration Request #${reconsiderations.length - index} - ${reconsideration.type.code}`,
          startDate: new Date(reconsideration.submittedDate + SORTING_ORDER.RECON_REQUEST),
          isFulfilled: true,
        });
      } else {
        events.push({
          htmlText: `Reconsideration Requested #${reconsiderations.length - index} - ${reconsideration.type.code}`,
          startDate: new Date(reconsideration.submittedDate + SORTING_ORDER.RECON_REQUEST),
          isFulfilled: true,
        });
        if (reconsideration.reviewDate) {
          events.push({
            htmlText: `Reconsideration Request Reviewed #${reconsiderations.length - index} - ${
              reconsideration.reviewOutcome?.label
            }`,
            startDate: new Date(reconsideration.reviewDate + SORTING_ORDER.RECON_REVIEW),
            isFulfilled: true,
          });
        }
      }
    }
    return events;
  }

  private mapModificationsToEvents(modifications: ApplicationModificationDto[]) {
    const events: TimelineEvent[] = [];
    for (const [index, modification] of modifications.sort((a, b) => b.submittedDate - a.submittedDate).entries()) {
      events.push({
        htmlText: `Modification Requested #${modifications.length - index} - ${
          modification.isTimeExtension ? 'Time Extension' : 'Other'
        }`,
        startDate: new Date(modification.submittedDate + SORTING_ORDER.MODIFICATION_REQUEST),
        isFulfilled: true,
      });
      if (modification.reviewDate) {
        events.push({
          htmlText: `Modification Request Reviewed #${modifications.length - index} - ${
            modification.reviewOutcome?.label
          }`,
          startDate: new Date(modification.reviewDate + SORTING_ORDER.MODIFICATION_REVIEW),
          isFulfilled: true,
        });
      }
    }
    return events;
  }

  onSaveSummary(updatedSummary: string) {
    if (this.application) {
      this.applicationDetailService.updateApplication(this.application.fileNumber, {
        summary: updatedSummary ?? null,
      });
    }
  }

  private async loadStatusHistory(fileNumber: string) {
    const statusHistory = await this.applicationSubmissionStatusService.fetchSubmissionStatusesByFileNumber(fileNumber);
    this.isCancelled =
      statusHistory.filter((status) => status.effectiveDate && status.statusTypeCode === SUBMISSION_STATUS.CANCELLED)
        .length > 0;
    this.$statusHistory.next(statusHistory);
  }
}
