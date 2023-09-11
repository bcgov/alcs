import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDetailService } from '../../services/notification/notification-detail.service';
import { NotificationSubmissionStatusService } from '../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationDto } from '../../services/notification/notification.dto';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { NotificationDocumentsComponent } from './documents/documents.component';
import { OverviewComponent } from './overview/overview.component';

export const preSubmissionRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
  },
  {
    path: 'applicant-info',
    menuTitle: 'App Preview',
    icon: 'persons',
    component: ApplicantInfoComponent,
    portalOnly: true,
  },
];

export const postSubmissionRoutes = [
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
    path: 'documents',
    menuTitle: 'Documents',
    icon: 'description',
    component: NotificationDocumentsComponent,
  },
];

@Component({
  selector: 'app-notice-of-intent',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  childRoutes: any[] = preSubmissionRoutes;

  fileNumber?: string;
  notification: NotificationDto | undefined;

  isAuthorized = true;

  constructor(
    private notificationDetailService: NotificationDetailService,
    private route: ActivatedRoute,
    private titleService: Title,
    public notificationSubmissionStatusService: NotificationSubmissionStatusService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.load();
    });

    this.notificationDetailService.$notification.pipe(takeUntil(this.destroy)).subscribe((notification) => {
      if (notification) {
        this.titleService.setTitle(`${environment.siteName} | ${notification.fileNumber} (${notification.applicant})`);
        this.notification = notification;
        this.childRoutes = !!notification.dateSubmittedToAlc ? postSubmissionRoutes : preSubmissionRoutes;
      }
    });
  }

  async load() {
    await this.notificationDetailService.load(this.fileNumber!);
  }

  ngOnDestroy(): void {
    this.notificationDetailService.clear();
    this.destroy.next();
    this.destroy.complete();
  }
}
