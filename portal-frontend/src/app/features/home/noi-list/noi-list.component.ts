import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SUBMISSION_STATUS } from '../../../services/application-submission/application-submission.dto';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentSubmissionDto,
} from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { InboxListItem } from '../inbox-list/inbox-list.component';

@Component({
  selector: 'app-noi-list',
  templateUrl: './noi-list.component.html',
  styleUrls: ['./noi-list.component.scss'],
})
export class NoiListComponent implements OnInit {
  dataSource: MatTableDataSource<NoticeOfIntentSubmissionDto> = new MatTableDataSource<NoticeOfIntentSubmissionDto>();
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

  constructor(private noiSubmissionService: NoticeOfIntentSubmissionService) {}

  ngOnInit(): void {
    this.loadNOIs();
  }

  async loadNOIs() {
    const nois = await this.noiSubmissionService.getNoticeOfIntents();
    this.dataSource = new MatTableDataSource(nois);
    this.dataSource.paginator = this.paginator;

    this.listItems = nois.map((noi) => ({
      ...noi,
      routerLink:
        noi.status.code !== NOI_SUBMISSION_STATUS.CANCELLED ? `/notice-of-intent/${noi.fileNumber}` : undefined,
    }));
  }
}
