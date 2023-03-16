import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  APPLICATION_STATUS,
  ApplicationSubmissionDto,
} from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';

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

  statusToCssMap = new Map<string, string>([
    [APPLICATION_STATUS.IN_PROGRESS, 'in-progress'],
    [APPLICATION_STATUS.SUBMITTED_TO_ALC, 'submitted-to-alc'],
    [APPLICATION_STATUS.SUBMITTED_TO_LG, 'submitted-to-lg'],
    [APPLICATION_STATUS.IN_REVIEW, 'in-review'],
    [APPLICATION_STATUS.REFUSED_TO_FORWARD, 'refused-to-forward'],
    [APPLICATION_STATUS.INCOMPLETE, 'incomplete'],
    [APPLICATION_STATUS.WRONG_GOV, 'wrong-government'],
    [APPLICATION_STATUS.CANCELLED, 'cancelled'],
  ]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private applicationService: ApplicationSubmissionService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications() {
    const applications = await this.applicationService.getApplications();
    this.dataSource = new MatTableDataSource(applications);
    this.dataSource.paginator = this.paginator;
  }
}
