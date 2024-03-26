import { Component, OnInit } from '@angular/core';
import { ApplicationModificationDto } from '../../../services/application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { HomeService } from '../../../services/home/home.service';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';
import { NoticeOfIntentModificationDto } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { PlanningReferralDto } from '../../../services/planning-review/planning-review.dto';
import {
  MODIFICATION_TYPE_LABEL,
  NOTIFICATION_LABEL,
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
  planningReferrals: AssignedToMeFile[] = [];
  notifications: AssignedToMeFile[] = [];
  inquiries: AssignedToMeFile[] = [];
  totalFiles = 0;

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
  ) {}

  ngOnInit(): void {
    this.applicationService.setup();
    this.loadApplications();
  }

  async loadApplications() {
    const {
      applications,
      reconsiderations,
      planningReferrals,
      modifications,
      noticeOfIntents,
      noticeOfIntentModifications,
      notifications,
      inquiries,
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

    this.planningReferrals = [
      ...planningReferrals
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapPlanningReferral(r))
        .sort((a, b) => a.date! - b.date!),
      ...planningReferrals
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapPlanningReferral(r))
        .sort((a, b) => a.date! - b.date!),
    ];

    this.inquiries = [
      ...inquiries
        .filter((r) => r.card!.highPriority)
        .map((r) => this.mapInquiry(r))
        .sort((a, b) => a.date! - b.date!),
      ...inquiries
        .filter((r) => !r.card!.highPriority)
        .map((r) => this.mapInquiry(r))
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
      this.applications.length +
      this.planningReferrals.length +
      this.noticeOfIntents.length +
      this.notifications.length;
  }

  private mapPlanningReferral(p: PlanningReferralDto): AssignedToMeFile {
    return {
      title: `${p.planningReview.fileNumber} (${p.planningReview.documentName})`,
      type: p.card.type,
      date: p.card.createdAt,
      card: p.card,
      highPriority: p.card.highPriority,
      labels: [p.planningReview.type],
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

  private mapInquiry(inquiry: InquiryDto) {
    return {
      title: `${inquiry.fileNumber} (${inquiry.inquirerLastName ?? 'Unknown'})`,
      type: inquiry.card!.type,
      card: inquiry.card!,
      date: inquiry.dateSubmittedToAlc,
      highPriority: inquiry.card!.highPriority,
      labels: [inquiry.type],
    };
  }
}
