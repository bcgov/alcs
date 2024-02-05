import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { NotificationSubmissionStatusDto, NotificationTypeDto } from '../../../services/notification/notification.dto';
import { NotificationSearchResultDto } from '../../../services/search/search.dto';
import { ApplicationSubmissionStatusPill } from '../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { TableChange } from '../search.interface';

interface SearchResult {
  fileNumber: string;
  dateSubmitted: number;
  ownerName: string;
  type?: NotificationTypeDto;
  government?: string;
  portalStatus?: string;
  referenceId: string;
  board?: string;
  class: string;
  status?: ApplicationSubmissionStatusPill;
}

@Component({
  selector: 'app-notification-search-table',
  templateUrl: './notification-search-table.component.html',
  styleUrls: ['./notification-search-table.component.scss'],
})
export class NotificationSearchTableComponent {
  _notifications: NotificationSearchResultDto[] = [];
  @Input() set notifications(notifications: NotificationSearchResultDto[]) {
    this._notifications = notifications;
    this.isLoading = false;
    this.dataSource = this.mapNotifications(notifications);
  }

  @Input() pageIndex: number = 0;
  @Input() statuses: NotificationSubmissionStatusDto[] = [];
  @Input() totalCount: number | undefined;
  @Input() regions: ApplicationRegionDto[] = [];

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'portalStatus'];
  dataSource: SearchResult[] = [];
  itemsPerPage = 20;
  total = 0;
  sortDirection: SortDirection = 'desc';
  sortField = 'dateSubmitted';
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

  onSortChange(sort: Sort) {
    this.pageIndex = 0;
    this.sortDirection = sort.direction;
    this.sortField = sort.active;

    this.onTableChange();
  }

  onSelectRecord(record: SearchResult) {
    const url = this.router.serializeUrl(this.router.createUrlTree([`/notification/${record.referenceId}`]));

    window.open(url, '_blank');
  }

  private mapNotifications(notifications: NotificationSearchResultDto[]): SearchResult[] {
    return notifications.map((e) => {
      const status = this.statuses.find((st) => st.code === e.status);

      return {
        fileNumber: e.fileNumber,
        dateSubmitted: e.dateSubmitted,
        ownerName: e.ownerName,
        type: e.type,
        localGovernmentName: e.localGovernmentName,
        portalStatus: e.portalStatus,
        referenceId: e.referenceId,
        board: e.boardCode,
        class: e.class,
        status: {
          backgroundColor: status!.alcsBackgroundColor,
          textColor: status!.alcsColor,
          borderColor: status!.alcsBackgroundColor,
          label: status!.label,
          shortLabel: status!.label,
        },
      };
    });
  }
}
