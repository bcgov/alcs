import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardStatusDto } from '../../../services/application/application-code.dto';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CardDto } from '../../../services/card/card.dto';
import { HomeService } from '../../../services/home/home.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
  styleUrls: ['./assigned.component.scss'],
})
export class AssignedComponent implements OnInit {
  assignedToMe: {
    applications: ApplicationDto[];
    reconsiderations: ApplicationReconsiderationDto[];
    planningReviews: PlanningReviewDto[];
  } = {
    applications: [],
    reconsiderations: [],
    planningReviews: [],
  };
  private statuses: CardStatusDto[] = [];

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationService.setup();
    this.applicationService.$cardStatuses.subscribe((statuses) => {
      this.statuses = statuses;
      if (this.statuses.length > 0) {
        this.loadApplications();
      }
    });
  }

  async loadApplications() {
    this.assignedToMe = await this.homeService.fetchAssignedToMe();

    this.assignedToMe.applications.sort((a, b) => {
      if (a.card.highPriority === b.card.highPriority) {
        return b.activeDays - a.activeDays;
      }
      if (a.card.highPriority) {
        return -1;
      } else {
        return 1;
      }
    });

    this.assignedToMe.reconsiderations.sort((a, b) => {
      if (a.card.highPriority === b.card.highPriority) {
        return b.submittedDate - a.submittedDate;
      }
      if (a.card.highPriority) {
        return -1;
      } else {
        return 1;
      }
    });

    this.assignedToMe.planningReviews.sort((a, b) => {
      if (a.card.highPriority === b.card.highPriority) {
        return b.card.createdAt - a.card.createdAt;
      }
      if (a.card.highPriority) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  onSelectCard(card: CardDto) {
    this.router.navigateByUrl(`/board/${card.board.code}?card=${card.uuid}&type=${card.type}`);
  }
}
