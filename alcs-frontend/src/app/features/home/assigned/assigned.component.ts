import { Component, OnInit } from '@angular/core';
import { ApplicationModificationDto } from '../../../services/application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CovenantDto } from '../../../services/covenant/covenant.dto';
import { HomeService } from '../../../services/home/home.service';
import { NoticeOfIntentModificationDto } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import {
  COVENANT_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  NOTIFICATION_LABEL,
  PLANNING_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RETROACTIVE_TYPE_LABEL,
} from '../../../shared/application-type-pill/application-type-pill.constants';
import { AssignedToMeFile } from './assigned-table/assigned-table.component';

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
  styleUrls: ['./assigned.component.scss'],
})
export class AssignedComponent implements OnInit {
  noticeOfIntents: AssignedToMeFile[] = [];
  applications: AssignedToMeFile[] = [];
  nonApplications: AssignedToMeFile[] = [];
  notifications: AssignedToMeFile[] = [];
  totalFiles = 0;

  constructor(private homeService: HomeService, private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applicationService.setup();
    this.loadApplications();
  }

  async loadApplications() {
    const {
      applications,
      reconsiderations,
      planningReviews,
      modifications,
      covenants,
      noticeOfIntents,
      noticeOfIntentModifications,
      notifications,
    } = await this.homeService.fetchAssignedToMe();

    this.noticeOfIntents = [
      ...noticeOfIntents
        .filter((a) => a.card!.highPriority)
        .map((a) => this.mapNoticeOfIntent(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...noticeOfIntentModifications
        .filter((a) => a.card!.highPriority)
        .map((a) => this.mapNoticeOfIntentModification(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...noticeOfIntents
        .filter((a) => !a.card!.highPriority)
        .map((a) => this.mapNoticeOfIntent(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...noticeOfIntentModifications
        .filter((a) => !a.card!.highPriority)
        .map((a) => this.mapNoticeOfIntentModification(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
    ];
    this.applications = [
      ...applications
        .filter((a) => a.card!.highPriority)
        .map((a) => this.mapApplication(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...modifications
        .filter((a) => a.card.highPriority)
        .map((a) => this.mapModification(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...reconsiderations
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapReconsideration(r))
        .sort((a, b) => a.date! - b.date!),
      ...applications
        .filter((a) => !a.card!.highPriority)
        .map((a) => this.mapApplication(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...modifications
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapModification(r))
        .sort((a, b) => a.date! - b.date!),
      ...reconsiderations
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapReconsideration(r))
        .sort((a, b) => a.date! - b.date!),
    ];

    this.nonApplications = [
      ...planningReviews
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapPlanning(r))
        .sort((a, b) => a.date! - b.date!),
      ...covenants
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapCovenant(r))
        .sort((a, b) => a.date! - b.date!),
      ...planningReviews
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapPlanning(r))
        .sort((a, b) => a.date! - b.date!),
      ...covenants
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapCovenant(r))
        .sort((a, b) => a.date! - b.date!),
    ];

    this.notifications = [
      ...notifications
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapNotifications(r))
        .sort((a, b) => a.date! - b.date!),
      ...notifications
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapNotifications(r))
        .sort((a, b) => a.date! - b.date!),
    ];

    this.totalFiles =
      this.applications.length + this.nonApplications.length + this.noticeOfIntents.length + this.notifications.length;
  }

  private mapCovenant(c: CovenantDto): AssignedToMeFile {
    return {
      title: `${c.fileNumber} (${c.applicant})`,
      type: c.card.type,
      date: c.card.createdAt,
      card: c.card,
      highPriority: c.card.highPriority,
      labels: [COVENANT_TYPE_LABEL],
    };
  }

  private mapPlanning(p: PlanningReviewDto): AssignedToMeFile {
    return {
      title: `${p.fileNumber} (${p.type})`,
      type: p.card.type,
      date: p.card.createdAt,
      card: p.card,
      highPriority: p.card.highPriority,
      labels: [PLANNING_TYPE_LABEL],
    };
  }

  private mapReconsideration(r: ApplicationReconsiderationDto): AssignedToMeFile {
    return {
      title: `${r.application.fileNumber} (${r.application.applicant})`,
      type: r.card.type,
      date: r.submittedDate,
      card: r.card,
      highPriority: r.card.highPriority,
      labels: [r.application.type, RECON_TYPE_LABEL],
    };
  }

  private mapApplication(a: ApplicationDto): AssignedToMeFile {
    return {
      title: `${a.fileNumber} (${a.applicant})`,
      activeDays: a.activeDays,
      type: a.card!.type,
      paused: a.paused,
      card: a.card!,
      highPriority: a.card!.highPriority,
      labels: [a.type],
    };
  }

  private mapModification(r: ApplicationModificationDto): AssignedToMeFile {
    return {
      title: `${r.application.fileNumber} (${r.application.applicant})`,
      type: r.card.type,
      date: r.submittedDate,
      card: r.card,
      highPriority: r.card.highPriority,
      labels: [r.application.type, MODIFICATION_TYPE_LABEL],
    };
  }

  private mapNoticeOfIntent(a: NoticeOfIntentDto): AssignedToMeFile {
    return {
      title: `${a.fileNumber} (${a.applicant})`,
      activeDays: a.activeDays,
      type: a.card!.type,
      paused: a.paused,
      card: a.card,
      highPriority: a.card!.highPriority,
      labels: a.retroactive ? [RETROACTIVE_TYPE_LABEL] : [],
    };
  }

  private mapNoticeOfIntentModification(a: NoticeOfIntentModificationDto): AssignedToMeFile {
    return {
      title: `${a.noticeOfIntent.fileNumber} (${a.noticeOfIntent.applicant})`,
      type: a.card!.type,
      card: a.card,
      date: a.submittedDate,
      highPriority: a.card!.highPriority,
      labels: a.noticeOfIntent.retroactive
        ? [MODIFICATION_TYPE_LABEL, RETROACTIVE_TYPE_LABEL]
        : [MODIFICATION_TYPE_LABEL],
    };
  }

  private mapNotifications(a: NotificationDto) {
    return {
      title: `${a.fileNumber} (${a.applicant})`,
      type: a.card!.type,
      card: a.card,
      date: a.dateSubmittedToAlc,
      highPriority: a.card!.highPriority,
      labels: [NOTIFICATION_LABEL],
    };
  }
}
