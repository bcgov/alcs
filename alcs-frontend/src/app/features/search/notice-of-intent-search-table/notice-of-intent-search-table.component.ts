import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { NoticeOfIntentStatusDto } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.dto';
import { NoticeOfIntentTypeDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentSearchResultDto } from '../../../services/search/search.dto';
import { ApplicationSubmissionStatusPill } from '../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { TableChange } from '../search.interface';

interface SearchResult {
  fileNumber: string;
  dateSubmitted: number;
  ownerName: string;
  type?: NoticeOfIntentTypeDto;
  government?: string;
  portalStatus?: string;
  referenceId: string;
  board?: string;
  class: string;
  status?: ApplicationSubmissionStatusPill;
}

@Component({
  selector: 'app-notice-of-intent-search-table',
  templateUrl: './notice-of-intent-search-table.component.html',
  styleUrls: ['./notice-of-intent-search-table.component.scss'],
})
export class NoticeOfIntentSearchTableComponent {
  _noticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
  @Input() set noticeOfIntents(noticeOfIntents: NoticeOfIntentSearchResultDto[]) {
    this._noticeOfIntents = noticeOfIntents;
    this.isLoading = false;
    this.dataSource = this.mapNoticeOfIntent(noticeOfIntents);
  }
  @Input() totalCount: number | undefined;
  @Input() statuses: NoticeOfIntentStatusDto[] = [];
  @Input() regions: ApplicationRegionDto[] = [];
  @Input() pageIndex: number = 0;

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
      tableType: 'NOI',
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
    const url = this.router.serializeUrl(this.router.createUrlTree([`/notice-of-intent/${record.referenceId}`]));

    window.open(url, '_blank');
  }

  private mapNoticeOfIntent(applications: NoticeOfIntentSearchResultDto[]): SearchResult[] {
    return applications.map((e) => {
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
