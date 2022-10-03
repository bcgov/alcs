import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardStatusDto } from '../../../services/application/application-code.dto';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { HomeService } from '../../../services/home/home.service';

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
  styleUrls: ['./assigned.component.scss'],
})
export class AssignedComponent implements OnInit {
  applications: ApplicationDto[] = [];
  private statuses: CardStatusDto[] = [];

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationService.setup();
    this.applicationService.$applicationStatuses.subscribe((statuses) => {
      this.statuses = statuses;
      if (this.statuses.length > 0) {
        this.loadApplications();
      }
    });
  }

  async loadApplications() {
    const apps = await this.homeService.fetchAssignedToMe();
    this.applications = apps.map((app) => {
      const statusDto = this.statuses.find((status) => status.code === app.status);
      return {
        ...app,
        status: statusDto!.label,
      };
    });
    this.applications.sort((a, b) => {
      if (a.highPriority === b.highPriority) {
        return b.activeDays - a.activeDays;
      }
      if (a.highPriority) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  onSelectCard(cardUuid: string, boardCode: string, cardTypeCode: string) {
    this.router.navigateByUrl(`/board/${boardCode}?app=${cardUuid}&type=${cardTypeCode}`);
  }
}
