import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { RECON_TYPE_LABEL } from '../board/dialogs/reconsiderations/reconsideration-dialog.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { DecisionComponent } from './decision/decision.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
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
  {
    path: 'post-decision',
    menuTitle: 'Post-Decision',
    component: PostDecisionComponent,
  },
];

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  application?: ApplicationDto;
  fileNumber?: string;
  reconLabel = RECON_TYPE_LABEL;

  childRoutes = childRoutes;
  reconsiderations: ApplicationReconsiderationDto[] = [];

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private reconsiderationService: ApplicationReconsiderationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.loadApplication();
    });

    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe((application) => {
      this.application = application;
      if (application) {
        this.reconsiderationService.fetchByApplication(application.fileNumber);
      }
    });
    this.reconsiderationService.$reconsiderations.pipe(takeUntil(this.destroy)).subscribe((recons) => {
      this.reconsiderations = [...recons].reverse(); //Reverse since we go low to high versus normally high to low
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
    const boardCode = this.application?.card.board.code;
    const fileNumber = this.application?.card.uuid;
    const cardTypeCode = this.application?.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${fileNumber}&type=${cardTypeCode}`);
  }

  async onGoToReconCard(recon: ApplicationReconsiderationDto) {
    const boardCode = recon.card.board.code;
    const cardTypeCode = recon.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${recon.card.uuid}&type=${cardTypeCode}`);
  }
}
