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
import { ApplicationSubmissionService } from '../../services/application/application-submission/application-submission.service';
import {
  ApplicationDto,
  ApplicationSubmissionDto,
  SUBMISSION_STATUS,
} from '../../services/application/application.dto';
import { SYSTEM_SOURCE_TYPES } from '../../shared/dto/system-source.types.dto';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { decisionChildRoutes, DecisionModule } from './decision/decision.module';
import { DocumentsComponent } from './documents/documents.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { LfngInfoComponent } from './lfng-info/lfng-info.component';
import { OverviewComponent } from './overview/overview.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { ProposalComponent } from './proposal/proposal.component';
import { ReviewComponent } from './review/review.component';

export const unsubmittedRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
    portalOnly: true,
  },
  {
    path: 'applicant-info',
    menuTitle: 'App Preview',
    icon: 'persons',
    component: ApplicantInfoComponent,
    portalOnly: true,
  },
];

export const submittedLfngRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
    portalOnly: true,
  },
  {
    path: 'applicant-info',
    menuTitle: 'Applicant Info',
    icon: 'persons',
    component: ApplicantInfoComponent,
    portalOnly: true,
  },
  {
    path: 'lfng-info',
    menuTitle: 'L/FNG Info',
    icon: 'account_balance',
    component: LfngInfoComponent,
    portalOnly: true,
  },
  {
    path: 'documents',
    menuTitle: 'Documents',
    icon: 'description',
    component: DocumentsComponent,
    portalOnly: false,
  },
];

export const appChildRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
    portalOnly: false,
  },
  {
    path: 'applicant-info',
    menuTitle: 'Applicant Info',
    icon: 'persons',
    component: ApplicantInfoComponent,
    portalOnly: true,
  },
  {
    path: 'lfng-info',
    menuTitle: 'L/FNG Info',
    icon: 'account_balance',
    component: LfngInfoComponent,
    portalOnly: true,
  },
  {
    path: 'intake',
    menuTitle: 'ALC Intake',
    icon: 'content_paste',
    component: IntakeComponent,
    portalOnly: false,
  },
  {
    path: 'prep',
    menuTitle: 'App Prep',
    icon: 'task',
    component: ProposalComponent,
    portalOnly: true,
  },
  {
    path: 'info-request',
    menuTitle: 'Info Request',
    icon: 'contact_mail',
    component: InfoRequestsComponent,
    portalOnly: false,
  },
  {
    path: 'site-visit-meeting',
    menuTitle: 'Site Visit /\nApplicant Meeting',
    icon: 'diversity_3',
    component: ApplicationMeetingComponent,
    portalOnly: false,
  },
  {
    path: 'review',
    menuTitle: 'Review',
    icon: 'rate_review',
    component: ReviewComponent,
    portalOnly: false,
  },
  {
    path: 'decision',
    menuTitle: 'Decisions',
    icon: 'gavel',
    module: DecisionModule,
    portalOnly: false,
    children: decisionChildRoutes,
  },
  {
    path: 'post-decision',
    menuTitle: 'Post-Decision',
    icon: 'edit_note',
    component: PostDecisionComponent,
    portalOnly: false,
  },
  {
    path: 'documents',
    menuTitle: 'Documents',
    icon: 'description',
    component: DocumentsComponent,
    portalOnly: false,
  },
];

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  childRoutes = appChildRoutes;
  unsubmittedRoutes = unsubmittedRoutes;
  submittedLfngRoutes = submittedLfngRoutes;

  fileNumber?: string;
  application: ApplicationDto | undefined;
  reconsiderations: ApplicationReconsiderationDto[] = [];
  modifications: ApplicationModificationDto[] = [];
  submission?: ApplicationSubmissionDto;

  isApplicantSubmission = false;
  showSubmittedToAlcMenuItems = false;
  showSubmittedToLfngMenuItems = false;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService,
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

    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe(async (application) => {
      if (application) {
        this.titleService.setTitle(`${environment.siteName} | ${application.fileNumber} (${application.applicant})`);
        this.application = application;
        this.reconsiderationService.fetchByApplication(application.fileNumber);
        this.modificationService.fetchByApplication(application.fileNumber);

        this.isApplicantSubmission = application.source === SYSTEM_SOURCE_TYPES.APPLICANT;
        let wasSubmittedToLfng = false;

        if (this.isApplicantSubmission) {
          this.submission = await this.applicationSubmissionService.fetchSubmission(application.fileNumber);

          wasSubmittedToLfng =
            this.isApplicantSubmission &&
            [
              SUBMISSION_STATUS.SUBMITTED_TO_LG,
              SUBMISSION_STATUS.IN_REVIEW_BY_LG,
              SUBMISSION_STATUS.WRONG_GOV,
              SUBMISSION_STATUS.INCOMPLETE,
            ].includes(this.submission?.status?.code);
        }

        const submittedToAlcsStatus = this.submission?.submissionStatuses.find(
          (s) => s.statusTypeCode === SUBMISSION_STATUS.SUBMITTED_TO_ALC && !!s.effectiveDate
        );
        this.showSubmittedToLfngMenuItems = wasSubmittedToLfng && !submittedToAlcsStatus;

        this.showSubmittedToAlcMenuItems = this.isApplicantSubmission ? !!submittedToAlcsStatus : true;
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
    this.applicationDetailService.clearApplication();
    this.destroy.next();
    this.destroy.complete();
  }

  async loadApplication() {
    await this.applicationDetailService.loadApplication(this.fileNumber!);
  }
}
