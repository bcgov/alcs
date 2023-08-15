import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NoticeOfIntentSubmissionDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private noiSubmissionService: NoticeOfIntentSubmissionService) {}

  ngOnInit(): void {
    this.loadNOIs();
  }

  async loadNOIs() {
    const nois = await this.noiSubmissionService.getNoticeOfIntents();
    this.dataSource = new MatTableDataSource(nois);
    this.dataSource.paginator = this.paginator;
  }
}
