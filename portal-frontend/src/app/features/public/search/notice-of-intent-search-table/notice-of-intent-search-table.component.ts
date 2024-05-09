import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApplicationStatusDto } from '../../../../services/application-submission/application-submission.dto';
import { displayedColumns, NoticeOfIntentSearchResultDto } from '../../../../services/search/search.dto';
import { SearchResult, TableChange } from '../search.interface';

@Component({
  selector: 'app-notice-of-intent-search-table',
  templateUrl: './notice-of-intent-search-table.component.html',
  styleUrls: ['./notice-of-intent-search-table.component.scss'],
})
export class NoticeOfIntentSearchTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @Input() pageIndex: number = 0;
  @Input() totalCount: number | undefined;

  _noticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
  @Input() set noticeOfIntents(noticeOfIntents: NoticeOfIntentSearchResultDto[]) {
    this._noticeOfIntents = noticeOfIntents;
    this.mapNoticeOfIntent();
    this.isLoading = false;
  }

  _statuses!: ApplicationStatusDto[];
  @Input() set statuses(statuses: ApplicationStatusDto[]) {
    this._statuses = statuses;
    this.mapNoticeOfIntent();
  }

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = displayedColumns;

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

  async onSelectRecord(record: SearchResult) {
    await this.router.navigateByUrl(`/public/notice-of-intent/${record.referenceId}`);
  }

  private mapNoticeOfIntent() {
    if (!this._noticeOfIntents || !this._statuses) {
      return;
    }
    const results = this._noticeOfIntents.map((e) => {
      const status = this._statuses.find((st) => st.code === e.status);

      return {
        ...e,
        status,
      };
    });
    this.dataSource = new MatTableDataSource<SearchResult>(results);
  }
}
