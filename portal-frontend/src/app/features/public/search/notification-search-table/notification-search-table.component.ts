import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationStatusDto } from '../../../../services/application-submission/application-submission.dto';
import { NotificationSearchResultDto } from '../../../../services/search/search.dto';
import { SearchResult, TableChange } from '../search.interface';

@Component({
  selector: 'app-notification-search-table',
  templateUrl: './notification-search-table.component.html',
  styleUrls: ['./notification-search-table.component.scss'],
})
export class NotificationSearchTableComponent {
  _notifications: NotificationSearchResultDto[] = [];

  @Input() statuses: ApplicationStatusDto[] = [];

  @Input() set notifications(notifications: NotificationSearchResultDto[]) {
    this._notifications = notifications;
    this.dataSource = new MatTableDataSource<SearchResult>(this.mapNotifications(notifications));
  }

  @Input() totalCount: number | undefined;
  @Input() pageIndex: number = 0;
  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'ownerName', 'type', 'portalStatus', 'lastUpdate', 'government'];
  dataSource = new MatTableDataSource<SearchResult>();
  itemsPerPage = 20;
  total = 0;
  sortDirection: SortDirection = 'desc';
  sortField = 'lastUpdate';
  isLoading = false;

  constructor(private router: Router) {}

  onTableChange() {
    this.isLoading = true;
    this.tableChange.emit({
      pageIndex: this.pageIndex,
      itemsPerPage: this.itemsPerPage,
      sortDirection: this.sortDirection,
      sortField: this.sortField,
      tableType: 'NOTI',
    });
  }

  onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.onTableChange();
  }

  onSortChange(sortChange: Sort) {
    this.pageIndex = 0;
    this.sortDirection = sortChange.direction;
    this.sortField = sortChange.active;
  }

  async onSelectRecord(record: SearchResult) {
    await this.router.navigateByUrl(`/public/notification/${record.referenceId}`);
  }

  private mapNotifications(notifications: NotificationSearchResultDto[]): SearchResult[] {
    return notifications.map((e) => {
      const status = this.statuses.find((st) => st.code === e.status);

      return {
        ...e,
        status,
      };
    });
  }
}
