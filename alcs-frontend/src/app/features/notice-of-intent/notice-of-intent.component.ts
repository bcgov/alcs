import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentSubmissionStatusService } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';
import { SYSTEM_SOURCE_TYPES } from '../../shared/dto/system-source.types.dto';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { decisionChildRoutes, DecisionModule } from './decision/decision.module';
import { NoiDocumentsComponent } from './documents/documents.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { ProposalComponent } from './proposal/proposal.component';
import { FileTagService } from '../../services/common/file-tag.service';
import { NoticeOfIntentTagService } from '../../services/notice-of-intent/notice-of-intent-tag/notice-of-intent-tag.service';
import { NoticeOfIntentDecisionConditionCardDto } from '../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionConditionCardService } from '../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';
import { DecisionConditionFinancialInstrumentService } from '../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';
import { NoticeOfIntentDecisionConditionFinancialInstrumentService } from '../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.service';

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

const preSubmissionRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
  },
  {
    path: 'applicant-info',
    menuTitle: 'NOI Preview',
    icon: 'persons',
    component: ApplicantInfoComponent,
    portalOnly: true,
  },
];

@Component({
    selector: 'app-notice-of-intent',
    templateUrl: './notice-of-intent.component.html',
    styleUrls: ['./notice-of-intent.component.scss'],
    providers: [
        { provide: FileTagService, useClass: NoticeOfIntentTagService },
        {
            provide: DecisionConditionFinancialInstrumentService,
            useClass: NoticeOfIntentDecisionConditionFinancialInstrumentService,
        },
    ],
    standalone: false
})
export class NoticeOfIntentComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  childRoutes = childRoutes;
  preSubmissionRoute = preSubmissionRoutes;

  fileNumber?: string;
  noticeOfIntent: NoticeOfIntentDto | undefined;
  modifications: NoticeOfIntentModificationDto[] = [];
  decisionConditionCards: NoticeOfIntentDecisionConditionCardDto[] = [];

  isApplicantSubmission = false;
  showSubmittedToAlcMenuItems = false;

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService,
    private decisionConditionCardService: NoticeOfIntentDecisionConditionCardService,
    private route: ActivatedRoute,
    private titleService: Title,
    public noticeOfIntentStatusService: NoticeOfIntentSubmissionStatusService,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.load();
    });

    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.destroy)).subscribe(async (noticeOfIntent) => {
      if (noticeOfIntent) {
        this.titleService.setTitle(
          `${environment.siteName} | ${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`,
        );

        this.isApplicantSubmission = noticeOfIntent.source === SYSTEM_SOURCE_TYPES.APPLICANT;

        if (this.isApplicantSubmission) {
          this.showSubmittedToAlcMenuItems = !!noticeOfIntent.dateSubmittedToAlc;
        }

        this.noticeOfIntentModificationService.fetchByFileNumber(noticeOfIntent.fileNumber);
        this.decisionConditionCardService.fetchByNoticeOfIntentFileNumber(noticeOfIntent.fileNumber);
        this.noticeOfIntent = noticeOfIntent;
      }
    });

    this.noticeOfIntentModificationService.$modifications.pipe(takeUntil(this.destroy)).subscribe((value) => {
      this.modifications = value;
    });

    this.decisionConditionCardService.$conditionCards.pipe(takeUntil(this.destroy)).subscribe((value) => {
      this.decisionConditionCards = value;
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
