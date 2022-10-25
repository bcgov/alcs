import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CardDto } from '../../../services/card/card.dto';
import { HomeService } from '../../../services/home/home.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';

interface AssignedToMeFile {
  title: string;
  activeDays?: number;
  type: string;
  date?: number;
  paused?: boolean;
  card: CardDto;
  highPriority?: boolean;
}

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
  styleUrls: ['./assigned.component.scss'],
})
export class AssignedComponent implements OnInit {
  sortedFiles: AssignedToMeFile[] = [];

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
    const { applications, reconsiderations, planningReviews } = await this.homeService.fetchAssignedToMe();

    const sorted = [];
    sorted.push(
      // high priority
      ...applications
        .filter((a) => a.card.highPriority)
        .map((a) => this.mapApplication(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...reconsiderations
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapReconsideration(r))
        .sort((a, b) => a.date! - b.date!),
      ...planningReviews
        .filter((r) => r.card.highPriority)
        .map((r) => this.mapPlanning(r))
        .sort((a, b) => a.date! - b.date!),

      // none high priority
      ...applications
        .filter((a) => !a.card.highPriority)
        .map((a) => this.mapApplication(a))
        .sort((a, b) => b.activeDays! - a.activeDays!),
      ...reconsiderations
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapReconsideration(r))
        .sort((a, b) => a.date! - b.date!),
      ...planningReviews
        .filter((r) => !r.card.highPriority)
        .map((r) => this.mapPlanning(r))
        .sort((a, b) => a.date! - b.date!)
    );

    this.sortedFiles = sorted;
  }

  private mapPlanning(p: PlanningReviewDto): AssignedToMeFile {
    return {
      title: `${p.fileNumber} (${p.type})`,
      type: p.card.type,
      date: p.card.createdAt,
      card: p.card,
      highPriority: p.card.highPriority,
    };
  }

  private mapReconsideration(r: ApplicationReconsiderationDto): AssignedToMeFile {
    return {
      title: `${r.application.fileNumber} (${r.application.applicant})`,
      type: r.card.type,
      date: r.submittedDate,
      card: r.card,
      highPriority: r.card.highPriority,
    };
  }

  private mapApplication(a: ApplicationDto): AssignedToMeFile {
    return {
      title: `${a.fileNumber} (${a.applicant})`,
      activeDays: a.activeDays,
      type: a.card.type,
      paused: a.paused,
      card: a.card,
      highPriority: a.card.highPriority,
    } as AssignedToMeFile;
  }

  onSelectCard(card: CardDto) {
    this.router.navigateByUrl(`/board/${card.board.code}?card=${card.uuid}&type=${card.type}`);
  }
}
