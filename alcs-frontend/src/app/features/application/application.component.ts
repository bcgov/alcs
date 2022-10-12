import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { DecisionComponent } from './decision/decision.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { ReviewComponent } from './review/review.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    component: OverviewComponent,
  },
  {
    path: 'intake',
    menuTitle: 'ALC Intake',
    component: IntakeComponent,
  },
  {
    path: 'info-request',
    menuTitle: 'Info Request',
    component: InfoRequestsComponent,
  },
  {
    path: 'site-visit-meeting',
    menuTitle: 'Site Visit / Applicant Meeting',
    component: ApplicationMeetingComponent,
  },
  {
    path: 'review',
    menuTitle: 'Review',
    component: ReviewComponent,
  },
  {
    path: 'decision',
    menuTitle: 'Decision',
    component: DecisionComponent,
  },
];

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  application?: ApplicationDetailedDto;
  fileNumber?: string;

  childRoutes = childRoutes;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.loadApplication();
    });

    this.applicationDetailService.$application.subscribe((application) => {
      this.application = application;
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async loadApplication() {
    await this.applicationDetailService.loadApplication(this.fileNumber!);
  }

  async onGoToCard() {
    const boardCode = this.application?.board;
    const fileNumber = this.application?.fileNumber;
    const cardTypeCode = this.application?.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?app=${fileNumber}&type=${cardTypeCode}`);
  }
}
