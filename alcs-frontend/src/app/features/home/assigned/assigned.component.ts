import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationModificationDto } from '../../../services/application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CardDto } from '../../../services/card/card.dto';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { HomeService } from '../../../services/home/home.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import { ApplicationPill } from '../../../shared/application-type-pill/application-type-pill.component';
import {
  COVENANT_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  PLANNING_TYPE_LABEL,
  RECON_TYPE_LABEL,
} from '../../../shared/application-type-pill/application-type-pill.constants';

interface AssignedToMeFile {
  title: string;
  activeDays?: number;
  type: string;
  date?: number;
  paused?: boolean;
  card: CardDto;
  highPriority?: boolean;
  labels: ApplicationPill[];
}

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
  styleUrls: ['./assigned.component.scss'],
})
export class AssignedComponent implements OnInit {
  sortedFiles: AssignedToMeFile[] = [];
  displayedColumns = ['highPriority', 'title', 'type', 'activeDays', 'stage'];

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationService.setup();
    this.loadApplications();
  }

  async loadApplications() {
    const { applications, reconsiderations, planningReviews, modifications, covenants } =
      await this.homeService.fetchAssignedToMe();

    const sorted = [];
    sorted.push(
      // high priority
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
      ...planningReviews
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapPlanning(r))
        .sort((a, b) => a.date! - b.date!),
      ...covenants
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapCovenant(r))
        .sort((a, b) => a.date! - b.date!),

      // none high priority
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
      ...planningReviews
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapPlanning(r))
        .sort((a, b) => a.date! - b.date!),
      ...covenants
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapCovenant(r))
        .sort((a, b) => a.date! - b.date!)
    );

    this.sortedFiles = sorted;
  }

  private mapCovenant(c: NoticeOfIntentDto): AssignedToMeFile {
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
      card: a.card,
      highPriority: a.card!.highPriority,
      labels: [a.type],
    } as AssignedToMeFile;
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

  async onSelectCard(card: CardDto) {
    await this.router.navigateByUrl(`/board/${card.board.code}?card=${card.uuid}&type=${card.type}`);
  }
}
