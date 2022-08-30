import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { ProcessingComponent } from './processing/processing.component';
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
    path: 'processing',
    menuTitle: 'Processing',
    component: ProcessingComponent,
  },
  {
    path: 'review',
    menuTitle: 'Review',
    component: ReviewComponent,
  },
  {
    path: 'site-visit-applicant',
    menuTitle: 'Site Visit / Applicant Meeting',
    component: ApplicationMeetingComponent,
  },
];

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent implements OnInit {
  application?: ApplicationDetailedDto;
  fileNumber?: string;

  childRoutes = childRoutes;

  constructor(private applicationDetailService: ApplicationDetailService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.loadApplication();
    });

    this.applicationDetailService.$application.subscribe((application) => {
      this.application = application;
    });
  }

  async loadApplication() {
    await this.applicationDetailService.loadApplication(this.fileNumber!);
  }
}
