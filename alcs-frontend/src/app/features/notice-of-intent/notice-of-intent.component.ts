import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';

import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { PreparationComponent } from './preparation/preparation.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
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
    component: PreparationComponent,
  },
  {
    path: 'info-request',
    menuTitle: 'Info Request',
    icon: 'contact_mail',
    component: InfoRequestsComponent,
    requiresAuthorization: true,
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

  isAuthorized = true;

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.load();
    });

    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.titleService.setTitle(
          `${environment.siteName} | ${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`
        );

        this.noticeOfIntent = noticeOfIntent;
      }
    });
  }

  ngOnDestroy(): void {
    this.noticeOfIntentDetailService.clear();
    this.destroy.next();
    this.destroy.complete();
  }

  async load() {
    await this.noticeOfIntentDetailService.load(this.fileNumber!);
  }
}
