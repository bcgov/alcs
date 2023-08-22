import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { decisionChildRoutes, DecisionModule } from './decision/decision.module';
import { NoiDocumentsComponent } from './documents/documents.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { ProposalComponent } from './proposal/proposal.component';

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
    portalOnly: true,
  },
  {
    path: 'intake',
    menuTitle: 'ALC Intake',
    icon: 'content_paste',
    component: IntakeComponent,
  },
  {
    path: 'prep',
    menuTitle: 'NOI Prep',
    icon: 'task',
    component: ProposalComponent,
  },
  {
    path: 'info-request',
    menuTitle: 'Info Request',
    icon: 'contact_mail',
    component: InfoRequestsComponent,
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
  },
  {
    path: 'documents',
    menuTitle: 'Documents',
    icon: 'description',
    component: NoiDocumentsComponent,
  },
];

@Component({
  selector: 'app-notice-of-intent',
  templateUrl: './notice-of-intent.component.html',
  styleUrls: ['./notice-of-intent.component.scss'],
})
export class NoticeOfIntentComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  childRoutes = childRoutes;

  fileNumber?: string;
  noticeOfIntent: NoticeOfIntentDto | undefined;
  modifications: NoticeOfIntentModificationDto[] = [];

  isAuthorized = true;

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.fileNumber = '100135';
    this.load();

    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
    });

    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.titleService.setTitle(
          `${environment.siteName} | ${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`
        );

        this.noticeOfIntentModificationService.fetchByFileNumber(noticeOfIntent.fileNumber);
        this.noticeOfIntent = noticeOfIntent;
      }
    });

    this.noticeOfIntentModificationService.$modifications.pipe(takeUntil(this.destroy)).subscribe((value) => {
      this.modifications = value;
    });
  }

  async load() {
    await this.noticeOfIntentDetailService.load(this.fileNumber!);
  }

  ngOnDestroy(): void {
    this.noticeOfIntentDetailService.clear();
    this.noticeOfIntentModificationService.clearModifications();
    this.destroy.next();
    this.destroy.complete();
  }
}
