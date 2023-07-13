import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  ApplicationSubmissionDto,
  SUBMISSION_STATUS,
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
    [SUBMISSION_STATUS.IN_PROGRESS, 'in-progress'],
    [SUBMISSION_STATUS.SUBMITTED_TO_ALC, 'submitted-to-alc'],
    [SUBMISSION_STATUS.SUBMITTED_TO_LG, 'submitted-to-lg'],
    [SUBMISSION_STATUS.IN_REVIEW_BY_FG, 'in-review'],
    [SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG, 'refused-to-forward'],
    [SUBMISSION_STATUS.INCOMPLETE, 'incomplete'],
    [SUBMISSION_STATUS.WRONG_GOV, 'wrong-government'],
    [SUBMISSION_STATUS.CANCELLED, 'cancelled'],
    [SUBMISSION_STATUS.ALC_DECISION, 'alc-decision'],
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
