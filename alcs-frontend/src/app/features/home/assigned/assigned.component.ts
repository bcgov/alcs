import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationAmendmentDto } from '../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CardDto } from '../../../services/card/card.dto';
import { CovenantDto } from '../../../services/covenant/covenant.dto';
import { HomeService } from '../../../services/home/home.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import { CardLabel } from '../../../shared/card/card.component';
import { AMENDMENT_TYPE_LABEL } from '../../board/dialogs/amendment/amendment-dialog.component';
import { COVENANT_TYPE_LABEL } from '../../board/dialogs/covenant/covenant-dialog.component';
import { PLANNING_TYPE_LABEL } from '../../board/dialogs/planning-review/planning-review-dialog.component';
import { RECON_TYPE_LABEL } from '../../board/dialogs/reconsiderations/reconsideration-dialog.component';

interface AssignedToMeFile {
  title: string;
  activeDays?: number;
  type: string;
  date?: number;
  paused?: boolean;
  card: CardDto;
  highPriority?: boolean;
  labels: CardLabel[];
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
    const { applications, reconsiderations, planningReviews, amendments, covenants } =
      await this.homeService.fetchAssignedToMe();

    const sorted = [];
    sorted.push(
      // high priority
      ...applications
        .filter((a) => a.card!.highPriority)
        .map((a) => this.mapApplication(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...amendments
        .filter((a) => a.card.highPriority)
        .map((a) => this.mapAmendment(a))
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
      ...amendments
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapAmendment(r))
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
      card: a.card,
      highPriority: a.card!.highPriority,
      labels: [a.type],
    } as AssignedToMeFile;
  }

  private mapAmendment(r: ApplicationAmendmentDto): AssignedToMeFile {
    return {
      title: `${r.application.fileNumber} (${r.application.applicant})`,
      type: r.card.type,
      date: r.submittedDate,
      card: r.card,
      highPriority: r.card.highPriority,
      labels: [r.application.type, AMENDMENT_TYPE_LABEL],
    };
  }

  onSelectCard(card: CardDto) {
    this.router.navigateByUrl(`/board/${card.board.code}?card=${card.uuid}&type=${card.type}`);
  }
}
