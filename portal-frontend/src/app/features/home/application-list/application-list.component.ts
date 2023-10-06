import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  ApplicationSubmissionDto,
  SUBMISSION_STATUS,
} from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { InboxListItem } from '../inbox-list/inbox-list.component';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
})
export class ApplicationListComponent implements OnInit {
  dataSource: MatTableDataSource<ApplicationSubmissionDto> = new MatTableDataSource<ApplicationSubmissionDto>();
  displayedColumns: string[] = [
    'fileNumber',
    'dateCreated',
    'applicant',
    'applicationType',
    'status',
    'lastUpdated',
    'actions',
  ];

  listItems: InboxListItem[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() isMobile = false;

  constructor(private applicationService: ApplicationSubmissionService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications() {
    const applications = await this.applicationService.getApplications();
    this.dataSource = new MatTableDataSource(applications);
    this.dataSource.paginator = this.paginator;

    this.listItems = applications.map((app) => ({
      ...app,
      routerLink: app.status.code !== SUBMISSION_STATUS.CANCELLED ? `/application/${app.fileNumber}` : undefined,
    }));
  }
}
