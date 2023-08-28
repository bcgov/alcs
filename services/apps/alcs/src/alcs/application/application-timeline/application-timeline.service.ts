import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecision } from '../../application-decision/application-decision.entity';
import { ApplicationModification } from '../../application-decision/application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../../application-decision/application-reconsideration/application-reconsideration.entity';
import { CardSubtask } from '../../card/card-subtask/card-subtask.entity';
import { ApplicationMeetingService } from '../application-meeting/application-meeting.service';
import { ApplicationSubmissionStatusService } from '../application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../application-submission-status/submission-status.dto';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';

export interface TimelineEvent {
  htmlText: string;
  startDate: number;
  fulfilledDate: number | null;
  isFulfilled: boolean;
  link?: string | null;
}

const SORTING_ORDER = {
  //high comes first, 1 shows at bottom
  MODIFICATION_REVIEW: 14,
  MODIFICATION_REQUEST: 13,
  RECON_REVIEW: 12,
  RECON_REQUEST: 11,
  CHAIR_REVIEW_DECISION: 10,
  AUDITED_DECISION: 9,
  READY_FOR_REVIEW_NOTIFICATION: 8,
  DECISION_MADE: 7,
  VISIT_REPORTS: 6,
  VISIT_REQUESTS: 5,
  ACKNOWLEDGE_COMPLETE: 4,
  FEE_RECEIVED: 3,
  ACKNOWLEDGED_INCOMPLETE: 2,
  SUBMITTED: 1,
};

const editLink = new Map<string, string>([
  ['IR', './info-request'],
  ['AM', './site-visit-meeting'],
  ['SV', './site-visit-meeting'],
]);

@Injectable()
export class ApplicationTimelineService {
  constructor(
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    @InjectRepository(ApplicationModification)
    private applicationModificationRepo: Repository<ApplicationModification>,
    @InjectRepository(ApplicationReconsideration)
    private applicationReconsiderationRepo: Repository<ApplicationReconsideration>,
    @InjectRepository(ApplicationDecision)
    private applicationDecisionRepo: Repository<ApplicationDecision>,
    private applicationService: ApplicationService,
    private applicationMeetingService: ApplicationMeetingService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
  ) {}

  async getTimelineEvents(fileNumber: string) {
    const events: TimelineEvent[] = [];
    const application = await this.applicationRepo.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: {
        decisionMeetings: true,
        type: true,
        card: {
          type: true,
          subtasks: {
            type: true,
          },
        },
      },
      withDeleted: true,
    });

    this.addApplicationEvents(application, events);
    await this.addDecisionEvents(application, events);
    await this.addReconsiderationEvents(application, events);
    await this.addModificationEvents(application, events);
    await this.addMeetingEvents(application, events);
    await this.addStatusEvents(application, events);

    if (application.card) {
      for (const subtask of application.card.subtasks) {
        const mappedEvent = this.mapSubtaskToEvent(subtask);
        events.push(mappedEvent);
      }
    }

    events.sort((a, b) => b.startDate - a.startDate);
    return events;
  }

  private addApplicationEvents(
    application: Application,
    events: TimelineEvent[],
  ) {
    if (application.feePaidDate) {
      events.push({
        htmlText: 'Fee Received Date',
        startDate:
          application.feePaidDate.getTime() + SORTING_ORDER.FEE_RECEIVED,
        fulfilledDate: null,
        isFulfilled: true,
      });
    }

    if (application.dateAcknowledgedComplete) {
      events.push({
        htmlText: 'Acknowledged Complete',
        startDate:
          application.dateAcknowledgedComplete.getTime() +
          SORTING_ORDER.ACKNOWLEDGE_COMPLETE,
        isFulfilled: true,
        fulfilledDate: null,
      });
    }

    if (application.notificationSentDate) {
      events.push({
        htmlText: "'Ready for Review' Notification Sent to Applicant",
        startDate:
          application.notificationSentDate.getTime() +
          SORTING_ORDER.READY_FOR_REVIEW_NOTIFICATION,
        fulfilledDate: null,
        isFulfilled: true,
      });
    }
  }

  private mapSubtaskToEvent(subtask: CardSubtask): TimelineEvent {
    return {
      htmlText: `${subtask.type.label} Subtask`,
      fulfilledDate: subtask.completedAt?.getTime() ?? null,
      startDate: subtask.createdAt.getTime(),
      isFulfilled: !!subtask.completedAt,
    };
  }

  private async addDecisionEvents(
    application: Application,
    events: TimelineEvent[],
  ) {
    const decisions = await this.applicationDecisionRepo.find({
      where: {
        applicationUuid: application.uuid,
        isDraft: false,
      },
      order: {
        date: 'DESC',
      },
    });

    if (decisions.length > 0) {
      const mappedApplications = await this.applicationService.mapToDtos([
        application,
      ]);
      const mappedApplication = mappedApplications[0];

      for (const [index, decision] of decisions.entries()) {
        if (decision.auditDate) {
          events.push({
            htmlText: `Audited Decision #${decisions.length - index}`,
            startDate:
              decision.auditDate.getTime() + SORTING_ORDER.AUDITED_DECISION,
            fulfilledDate: null,
            isFulfilled: true,
          });
        }

        if (decision.chairReviewDate) {
          events.push({
            htmlText: `Chair Reviewed Decision #${decisions.length - index}`,
            startDate:
              decision.chairReviewDate.getTime() +
              SORTING_ORDER.CHAIR_REVIEW_DECISION,
            fulfilledDate: null,
            isFulfilled: true,
          });
        }

        events.push({
          htmlText: `Decision #${decisions.length - index} Made${
            decisions.length - 1 === index
              ? ` - Active Days: ${mappedApplication.activeDays}`
              : ''
          }`,
          startDate: decision.date!.getTime() + SORTING_ORDER.DECISION_MADE,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }
    }
  }

  private async addReconsiderationEvents(
    application: Application,
    events: TimelineEvent[],
  ) {
    const reconsiderations = await this.applicationReconsiderationRepo.find({
      where: {
        applicationUuid: application.uuid,
      },
      relations: {
        card: {
          subtasks: {
            type: true,
          },
        },
      },
      order: {
        submittedDate: 'DESC',
      },
    });

    for (const [index, reconsideration] of reconsiderations.entries()) {
      if (reconsideration.type.code === '33.1') {
        events.push({
          htmlText: `Reconsideration Request #${
            reconsiderations.length - index
          } - ${reconsideration.type.code}`,
          startDate:
            reconsideration.submittedDate.getTime() +
            SORTING_ORDER.RECON_REQUEST,
          fulfilledDate: null,
          isFulfilled: true,
        });
      } else {
        events.push({
          htmlText: `Reconsideration Requested #${
            reconsiderations.length - index
          } - ${reconsideration.type.code}`,
          startDate:
            reconsideration.submittedDate.getTime() +
            SORTING_ORDER.RECON_REQUEST,
          fulfilledDate: null,
          isFulfilled: true,
        });
        if (reconsideration.reviewDate) {
          events.push({
            htmlText: `Reconsideration Request Reviewed #${
              reconsiderations.length - index
            } - ${reconsideration.reviewOutcome?.label}`,
            startDate:
              reconsideration.reviewDate.getTime() + SORTING_ORDER.RECON_REVIEW,
            fulfilledDate: null,
            isFulfilled: true,
          });
        }
      }
    }
  }

  private async addModificationEvents(
    application: Application,
    events: TimelineEvent[],
  ) {
    const modifications = await this.applicationModificationRepo.find({
      where: {
        applicationUuid: application.uuid,
      },
      relations: {
        card: {
          subtasks: {
            type: true,
          },
        },
      },
      order: {
        submittedDate: 'DESC',
      },
    });

    for (const [index, modification] of modifications.entries()) {
      events.push({
        htmlText: `Modification Requested #${modifications.length - index} - ${
          modification.isTimeExtension ? 'Time Extension' : 'Other'
        }`,
        startDate:
          modification.submittedDate.getTime() +
          SORTING_ORDER.MODIFICATION_REQUEST,
        fulfilledDate: null,
        isFulfilled: true,
      });

      if (modification.card) {
        for (const subtask of modification.card.subtasks) {
          const mappedEvent = this.mapSubtaskToEvent(subtask);
          events.push(mappedEvent);
        }
      }

      if (modification.reviewDate) {
        events.push({
          htmlText: `Modification Request Reviewed #${
            modifications.length - index
          } - ${modification.reviewOutcome.label}`,
          startDate:
            modification.reviewDate.getTime() +
            SORTING_ORDER.MODIFICATION_REVIEW,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }
    }
  }

  private async addMeetingEvents(
    noticeOfIntent: Application,
    events: TimelineEvent[],
  ) {
    const meetings = await this.applicationMeetingService.getByAppFileNumber(
      noticeOfIntent.fileNumber,
    );

    meetings.sort(
      (a, b) =>
        a.meetingPause!.startDate.getTime() -
        b.meetingPause!.startDate.getTime(),
    );

    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.type.code) || 0;

      const meetingStartDate = meeting.meetingPause?.startDate.getTime();
      const meetingEndDate = meeting.meetingPause?.endDate?.getTime();

      if (meetingStartDate) {
        events.push({
          htmlText: `${meeting.type.label} #${count + 1}`,
          startDate: meetingStartDate + SORTING_ORDER.VISIT_REQUESTS,
          fulfilledDate: meetingEndDate ?? null,
          isFulfilled: !!meetingEndDate,
          link: editLink.get(meeting.type.code),
        });
      }

      const reportStartDate = meeting.reportPause?.startDate.getTime();
      const reportEndDate = meeting.reportPause?.endDate?.getTime();
      if (reportStartDate) {
        events.push({
          htmlText: `${meeting.type.label} #${
            count + 1
          } Report Sent to Applicant`,
          startDate: reportStartDate + SORTING_ORDER.VISIT_REPORTS,
          fulfilledDate: reportEndDate ?? null,
          isFulfilled: !!reportEndDate,
          link: editLink.get(meeting.type.code),
        });
      }

      typeCount.set(meeting.type.code, count + 1);
    });
  }

  private async addStatusEvents(
    application: Application,
    events: TimelineEvent[],
  ) {
    const statusHistory =
      await this.applicationSubmissionStatusService.getStatusesByFileNumber(
        application.fileNumber,
      );

    const statusesToInclude = statusHistory.filter(
      (status) =>
        ![SUBMISSION_STATUS.IN_REVIEW_BY_ALC].includes(
          <SUBMISSION_STATUS.IN_REVIEW_BY_ALC>status.statusType.code,
        ),
    );
    for (const status of statusesToInclude) {
      if (status.effectiveDate) {
        let htmlText = `<strong>${status.statusType.label}</strong>`;

        if (status.statusType.code === SUBMISSION_STATUS.RECEIVED_BY_ALC) {
          htmlText = 'Received All Items - <strong>Received by ALC</strong>';
        }

        if (status.statusType.code === SUBMISSION_STATUS.IN_PROGRESS) {
          htmlText = 'Created - <strong>In Progress</strong>';
        }

        if (
          status.statusType.code ===
          SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE
        ) {
          htmlText =
            'Acknowledged Incomplete - <strong>Submitted to ALC - Incomplete</strong>';
        }

        events.push({
          htmlText,
          startDate: status.effectiveDate.getTime() + status.statusType.weight,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }
    }
  }
}
