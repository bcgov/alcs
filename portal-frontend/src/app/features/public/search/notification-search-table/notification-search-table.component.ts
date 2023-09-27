import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationStatusDto } from '../../../../services/application-submission/application-submission.dto';
import { NotificationSearchResultDto } from '../../../../services/search/search.dto';
import { SearchResult, TableChange } from '../search.interface';

@Component({
  selector: 'app-notification-search-table',
  templateUrl: './notification-search-table.component.html',
  styleUrls: ['./notification-search-table.component.scss'],
})
export class NotificationSearchTableComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  _notifications: NotificationSearchResultDto[] = [];

  @Input() statuses: ApplicationStatusDto[] = [];

  @Input() set notifications(notifications: NotificationSearchResultDto[]) {
    this._notifications = notifications;
    this.dataSource = this.mapNotifications(notifications);
  }

  _totalCount = 0;
  @Input() set totalCount(count: number) {
    this._totalCount = count;
    this.initSorting();
  }

  @Input() regions: string[] = [];
  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'ownerName', 'type', 'portalStatus', 'lastUpdate', 'government'];
  dataSource: SearchResult[] = [];
  pageIndex = 0;
  itemsPerPage = 20;
  total = 0;
  sortDirection = 'DESC';
  sortField = 'lastUpdate';

  private subscribedToSort = false;

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onTableChange() {
    this.tableChange.emit({
      pageIndex: this.pageIndex,
      itemsPerPage: this.itemsPerPage,
      sortDirection: this.sortDirection,
      sortField: this.sortField,
      tableType: 'NOTI',
    });
  }

  async onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    await this.onTableChange();
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

  private initSorting() {
    if (this._totalCount <= 0) {
      this.subscribedToSort = false;
    }

    // push subscription to next render cycle, after the table is rendered
    setTimeout(() => {
      if (this.sort && !this.subscribedToSort) {
        this.subscribedToSort = true;
        this.sort.sortChange.pipe(takeUntil(this.$destroy)).subscribe(async (sortObj) => {
          this.paginator.pageIndex = 0;
          this.pageIndex = 0;
          this.sortDirection = sortObj.direction.toUpperCase();
          this.sortField = sortObj.active;

          await this.onTableChange();
        });
      }
    });
  }
}
