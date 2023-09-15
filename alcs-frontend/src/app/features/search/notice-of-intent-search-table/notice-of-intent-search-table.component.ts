import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { ApplicationStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
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
export class NoticeOfIntentSearchTableComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  _noticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
  @Input() set noticeOfIntents(noticeOfIntents: NoticeOfIntentSearchResultDto[]) {
    this._noticeOfIntents = noticeOfIntents;
    this.dataSource = this.mapNoticeOfIntent(noticeOfIntents);
  }

  _totalCount = 0;
  @Input() set totalCount(count: number) {
    this._totalCount = count;
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

  @Input() statuses: ApplicationStatusDto[] = [];
  @Input() regions: ApplicationRegionDto[] = [];

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'portalStatus'];
  dataSource: SearchResult[] = [];
  pageIndex = 0;
  itemsPerPage = 20;
  total = 0;
  sortDirection = 'DESC';
  sortField = 'dateSubmitted';

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
      tableType: 'APP',
    });
  }

  async onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    await this.onTableChange();
  }

  async onSelectRecord(record: SearchResult) {
    const url = this.router.serializeUrl(this.router.createUrlTree([`/notice-of-intent/${record.referenceId}`]));

    window.open(url, '_blank');
  }

  private mapNoticeOfIntent(applications: NoticeOfIntentSearchResultDto[]) {
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
          // TODO there no pills for NOI status yet. This needs to be addressed once noi statuses are done
          backgroundColor: '#fcba19',
          textColor: '#002f17',
          borderColor: '#fcba19',
          label: status?.label,
          shortLabel: status?.label,
        },
      };
    });
  }
}
