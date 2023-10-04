import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NOI_SUBMISSION_STATUS } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import {
  NOTIFICATION_STATUS,
  NotificationSubmissionDto,
} from '../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';
import { InboxListItem } from '../inbox-list/inbox-list.component';

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

  listItems: InboxListItem[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() isMobile = false;

  constructor(private notificationSubmissionService: NotificationSubmissionService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  async loadNotifications() {
    const notifications = await this.notificationSubmissionService.getNotifications();
    this.dataSource = new MatTableDataSource(notifications);
    this.dataSource.paginator = this.paginator;

    this.listItems = notifications.map((notification) => ({
      ...notification,
      routerLink:
        notification.status.code !== NOTIFICATION_STATUS.CANCELLED
          ? `/notification/${notification.fileNumber}`
          : undefined,
    }));
  }
}
