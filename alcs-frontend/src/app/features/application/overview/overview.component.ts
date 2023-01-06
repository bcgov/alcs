import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatestWith, tap } from 'rxjs';
import { ApplicationDecisionDto } from '../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../services/application/application-decision/application-decision.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationMeetingDto } from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ApplicationModificationDto } from '../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { TimelineEvent } from '../../../shared/timeline/timeline.component';

const editLink = new Map<string, string>([
  ['IR', './info-request'],
  ['AM', './site-visit-meeting'],
  ['SV', './site-visit-meeting'],
]);

const SORTING_ORDER = {
  //high comes first, 1 shows at bottom
  MODIFICATION_REVIEW: 12,
  MODIFICATION_REQUEST: 11,
  RECON_REVIEW: 10,
  RECON_REQUEST: 9,
  CHAIR_REVIEW_DECISION: 8,
  AUDITED_DECISION: 7,
  DECISION_MADE: 6,
  VISIT_REPORTS: 5,
  VISIT_REQUESTS: 4,
  ACKNOWLEDGE_COMPLETE: 3,
  ACKNOWLEDGED_INCOMPLETE: 2,
  SUBMITTED: 1,
};

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  private application?: ApplicationDto;
  private $decisions = new BehaviorSubject<ApplicationDecisionDto[]>([]);
  events: TimelineEvent[] = [];
  summary = '';

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private meetingService: ApplicationMeetingService,
    private decisionService: ApplicationDecisionService,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application
      .pipe(
        tap((app) => {
          if (app) {
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
          this.modificationService.$modifications
        )
      )
      .subscribe(([application, meetings, decisions, reconsiderations, modifications]) => {
        if (application) {
          this.summary = application.summary || '';
          this.application = application;
          this.events = this.mapApplicationToEvents(application, meetings, decisions, reconsiderations, modifications);
        }
      });
  }

  mapApplicationToEvents(
    application: ApplicationDto,
    meetings: ApplicationMeetingDto[],
    decisions: ApplicationDecisionDto[],
    reconsiderations: ApplicationReconsiderationDto[],
    modifications: ApplicationModificationDto[]
  ): TimelineEvent[] {
    const mappedEvents: TimelineEvent[] = [];
    if (application.dateSubmittedToAlc) {
      mappedEvents.push({
        name: 'Submitted to ALC',
        startDate: new Date(application.dateSubmittedToAlc + SORTING_ORDER.SUBMITTED),
        isFulfilled: true,
      });
    }

    if (application.dateAcknowledgedIncomplete) {
      mappedEvents.push({
        name: 'Acknowledged Incomplete',
        startDate: new Date(application.dateAcknowledgedIncomplete + SORTING_ORDER.ACKNOWLEDGED_INCOMPLETE),
        isFulfilled: true,
      });
    }

    if (application.dateAcknowledgedComplete) {
      mappedEvents.push({
        name: 'Acknowledged Complete',
        startDate: new Date(application.dateAcknowledgedComplete + SORTING_ORDER.ACKNOWLEDGE_COMPLETE),
        isFulfilled: true,
      });
    }

    if (application.decisionMeetings.length) {
      const events: TimelineEvent[] = application.decisionMeetings.map((meeting, index) => ({
        name: `Review Discussion #${index + 1}`,
        startDate: new Date(meeting.date),
        isFulfilled: true,
      }));
      mappedEvents.push(...events);
    }

    for (const [index, decision] of decisions.entries()) {
      if (decision.auditDate) {
        mappedEvents.push({
          name: `Audited Decision #${decisions.length - index}`,
          startDate: new Date(decision.auditDate + SORTING_ORDER.AUDITED_DECISION),
          isFulfilled: true,
        });
      }

      if (decision.chairReviewDate) {
        mappedEvents.push({
          name: `Chair Reviewed Decision #${decisions.length - index}`,
          startDate: new Date(decision.chairReviewDate + SORTING_ORDER.CHAIR_REVIEW_DECISION),
          isFulfilled: true,
        });
      }

      mappedEvents.push({
        name: `Decision #${decisions.length - index} Made${
          decisions.length - 1 === index ? ` - Active Days: ${application.activeDays}` : ''
        }`,
        startDate: new Date(decision.date + SORTING_ORDER.DECISION_MADE),
        isFulfilled: true,
      });
    }

    if (application.notificationSentDate) {
      mappedEvents.push({
        name: "'Ready for Review' Notification Sent to Applicant",
        startDate: new Date(application.notificationSentDate),
        isFulfilled: true,
      });
    }

    meetings.sort((a, b) => a.meetingStartDate - b.meetingStartDate);
    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.meetingType.code) || 0;

      mappedEvents.push({
        name: `${meeting.meetingType.label} #${count + 1}`,
        startDate: new Date(meeting.meetingStartDate + SORTING_ORDER.VISIT_REQUESTS),
        fulfilledDate: meeting.meetingEndDate ? new Date(meeting.meetingEndDate) : undefined,
        isFulfilled: !!meeting.meetingEndDate,
        link: editLink.get(meeting.meetingType.code),
      });

      if (meeting.reportStartDate) {
        mappedEvents.push({
          name: `${meeting.meetingType.label} #${count + 1} Sent to Applicant`,
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
          name: `Reconsideration Request #${reconsiderations.length - index} - ${reconsideration.type.code}`,
          startDate: new Date(reconsideration.submittedDate + SORTING_ORDER.RECON_REQUEST),
          isFulfilled: true,
        });
      } else {
        events.push({
          name: `Reconsideration Requested #${reconsiderations.length - index} - ${reconsideration.type.code}`,
          startDate: new Date(reconsideration.submittedDate + SORTING_ORDER.RECON_REQUEST),
          isFulfilled: true,
        });
        if (reconsideration.reviewDate) {
          events.push({
            name: `Reconsideration Request Reviewed #${reconsiderations.length - index} - ${
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
        name: `Modification Requested #${modifications.length - index} - ${
          modification.isTimeExtension ? 'Time Extension' : 'Other'
        }`,
        startDate: new Date(modification.submittedDate + SORTING_ORDER.MODIFICATION_REQUEST),
        isFulfilled: true,
      });
      if (modification.reviewDate) {
        events.push({
          name: `Modification Request Reviewed #${modifications.length - index} - ${modification.reviewOutcome?.label}`,
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
        summary: updatedSummary,
      });
    }
  }
}
