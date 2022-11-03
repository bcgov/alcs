import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatestWith, tap } from 'rxjs';
import { ApplicationAmendmentDto } from '../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../../services/application/application-amendment/application-amendment.service';
import { ApplicationDecisionDto } from '../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../services/application/application-decision/application-decision.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationMeetingDto } from '../../../services/application/application-meeting/application-meeting.dto';
import { ApplicationMeetingService } from '../../../services/application/application-meeting/application-meeting.service';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { TimelineEvent } from '../../../shared/timeline/timeline.component';

const editLink = new Map<string, string>([
  ['IR', './info-request'],
  ['AM', './site-visit-meeting'],
  ['SV', './site-visit-meeting'],
]);

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
    private amendmentService: ApplicationAmendmentService
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
          this.amendmentService.$amendments
        )
      )
      .subscribe(([application, meetings, decisions, reconsiderations, amendments]) => {
        if (application) {
          this.summary = application.summary || '';
          this.application = application;
          this.events = this.mapApplicationToEvents(application, meetings, decisions, reconsiderations, amendments);
        }
      });
  }

  mapApplicationToEvents(
    application: ApplicationDto,
    meetings: ApplicationMeetingDto[],
    decisions: ApplicationDecisionDto[],
    reconsiderations: ApplicationReconsiderationDto[],
    amendments: ApplicationAmendmentDto[]
  ): TimelineEvent[] {
    const mappedEvents: TimelineEvent[] = [];
    if (application.dateReceived) {
      mappedEvents.push({
        name: 'Submitted to ALC',
        startDate: new Date(application.dateReceived),
        isFulfilled: true,
      });
    }

    if (application.dateAcknowledgedIncomplete) {
      mappedEvents.push({
        name: 'Acknowledged Incomplete',
        startDate: new Date(application.dateAcknowledgedIncomplete),
        isFulfilled: true,
      });
    }

    if (application.dateAcknowledgedComplete) {
      mappedEvents.push({
        name: 'Acknowledged Complete',
        startDate: new Date(application.dateAcknowledgedComplete),
        isFulfilled: true,
      });
    }

    if (application.decisionMeetings.length) {
      const events: TimelineEvent[] = application.decisionMeetings.map((meeting, index) => ({
        name: application.decisionMeetings.length === 1 ? `Scheduled Discussion` : `Scheduled Discussion #${index + 1}`,
        startDate: new Date(meeting.date),
        isFulfilled: true,
      }));
      mappedEvents.push(...events);
    }

    for (const [index, decision] of decisions.entries()) {
      if (decision.auditDate) {
        mappedEvents.push({
          name: `Audited Decision #${decisions.length - index}`,
          startDate: new Date(decision.auditDate),
          isFulfilled: true,
        });
      }

      if (decision.chairReviewDate) {
        mappedEvents.push({
          name: `Chair Reviewed Decision #${decisions.length - index}`,
          startDate: new Date(decision.chairReviewDate),
          isFulfilled: true,
        });
      }

      mappedEvents.push({
        name: `Decision #${decisions.length - index} Made`,
        startDate: new Date(decision.date),
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
        name: `${meeting.meetingType.label} #${count + 1} Requested`,
        startDate: new Date(meeting.meetingStartDate),
        fulfilledDate: meeting.meetingEndDate ? new Date(meeting.meetingEndDate) : undefined,
        isFulfilled: !!meeting.meetingEndDate,
        link: editLink.get(meeting.meetingType.code),
      });

      if (meeting.reportStartDate) {
        mappedEvents.push({
          name: `${meeting.meetingType.label} #${count + 1} Sent to Applicant`,
          startDate: new Date(meeting.reportStartDate),
          fulfilledDate: meeting.reportEndDate ? new Date(meeting.reportEndDate) : undefined,
          isFulfilled: !!meeting.reportEndDate,
          link: editLink.get(meeting.meetingType.code),
        });
      }

      typeCount.set(meeting.meetingType.code, count + 1);
    });

    const mappedReconsiderations = this.mapReconsiderationsToEvents(reconsiderations);
    mappedEvents.push(...mappedReconsiderations);

    const mappedAmendments = this.mapAmendmentsToEvents(amendments);
    mappedEvents.push(...mappedAmendments);

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
          name: `Reconsideration Request #${reconsiderations.length - index} ${reconsideration.type.code}`,
          startDate: new Date(reconsideration.submittedDate),
          isFulfilled: true,
        });
      } else {
        events.push({
          name: `Reconsideration Requested #${reconsiderations.length - index} ${reconsideration.type.code}`,
          startDate: new Date(reconsideration.submittedDate),
          isFulfilled: true,
        });
        if (reconsideration.reviewDate) {
          events.push({
            name: `Reconsideration Request Reviewed #${reconsiderations.length - index} ${
              reconsideration.isReviewApproved ? 'Proceed' : 'Refused'
            }`,
            startDate: new Date(reconsideration.reviewDate),
            isFulfilled: true,
          });
        }
      }
    }
    return events;
  }

  private mapAmendmentsToEvents(amendments: ApplicationAmendmentDto[]) {
    const events: TimelineEvent[] = [];
    for (const [index, amendment] of amendments.sort((a, b) => b.submittedDate - a.submittedDate).entries()) {
      events.push({
        name: `Amendment Requested #${amendments.length - index} - ${
          amendment.isTimeExtension ? 'Time Extension' : 'Other'
        }`,
        startDate: new Date(amendment.submittedDate),
        isFulfilled: true,
      });
      if (amendment.reviewDate) {
        events.push({
          name: `Amendment Request Reviewed #${amendments.length - index} ${
            amendment.isReviewApproved ? 'Proceed' : 'Refused'
          }`,
          startDate: new Date(amendment.reviewDate),
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
