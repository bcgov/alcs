import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationSubmissionDto } from '../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
})
export class NotificationListComponent implements OnInit {
  dataSource: MatTableDataSource<NotificationSubmissionDto> = new MatTableDataSource<NotificationSubmissionDto>();
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

  constructor(private notificationSubmissionService: NotificationSubmissionService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  async loadNotifications() {
    const notifications = await this.notificationSubmissionService.getNotifications();
    this.dataSource = new MatTableDataSource(notifications);
    this.dataSource.paginator = this.paginator;
  }
}
