import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { DecisionComponent } from './decision/decision.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { LfngInfoComponent } from './lfng-info/lfng-info.component';
import { OverviewComponent } from './overview/overview.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { ReviewComponent } from './review/review.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
  },
  {
    path: 'applicant-info',
    menuTitle: 'Applicant Info',
    icon: 'persons',
    component: ApplicantInfoComponent,
  },
  {
    path: 'lfng-info',
    menuTitle: 'L/FNG Info',
    icon: 'account_balance',
    component: LfngInfoComponent,
  },
  {
    path: 'intake',
    menuTitle: 'ALC Intake',
    icon: 'content_paste',
    component: IntakeComponent,
  },
  {
    path: 'info-request',
    menuTitle: 'Info Request',
    icon: 'contact_mail',
    component: InfoRequestsComponent,
  },
  {
    path: 'site-visit-meeting',
    menuTitle: 'Site Visit /\nApplicant Meeting',
    icon: 'diversity_3',
    component: ApplicationMeetingComponent,
  },
  {
    path: 'review',
    menuTitle: 'Review',
    icon: 'rate_review',
    component: ReviewComponent,
  },
  {
    path: 'decision',
    menuTitle: 'Decision',
    icon: 'gavel',
    component: DecisionComponent,
  },
  {
    path: 'post-decision',
    menuTitle: 'Post-Decision',
    icon: 'edit_note',
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
  childRoutes = childRoutes;

  fileNumber?: string;
  application: ApplicationDto | undefined;
  reconsiderations: ApplicationReconsiderationDto[] = [];
  modifications: ApplicationModificationDto[] = [];

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.loadApplication();
    });

    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe((application) => {
      if (application) {
        this.titleService.setTitle(`${environment.siteName} | ${application.fileNumber} (${application.applicant})`);

        this.application = application;
        this.reconsiderationService.fetchByApplication(application.fileNumber);
        this.modificationService.fetchByApplication(application.fileNumber);
      }
    });

    this.reconsiderationService.$reconsiderations.pipe(takeUntil(this.destroy)).subscribe((recons) => {
      this.reconsiderations = [...recons].reverse(); //Reverse since we go low to high versus normally high to low
    });

    this.modificationService.$modifications.pipe(takeUntil(this.destroy)).subscribe((modifications) => {
      this.modifications = [...modifications].reverse(); //Reverse since we go low to high versus normally high to low
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async loadApplication() {
    await this.applicationDetailService.loadApplication(this.fileNumber!);
  }
}
