import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NonApplicationSearchResultDto } from '../../../services/search/search.dto';
import {
  COVENANT_TYPE_LABEL,
  PLANNING_TYPE_LABEL,
} from '../../../shared/application-type-pill/application-type-pill.constants';
import { TableChange } from '../search.interface';

interface SearchResult {
  fileNumber: string;
  applicant: string;
  localGovernmentName?: string;
  referenceId: string;
  board?: string;
  class: string;
}

@Component({
  selector: 'app-non-application-search-table',
  templateUrl: './non-application-search-table.component.html',
  styleUrls: ['./non-application-search-table.component.scss'],
})
export class NonApplicationSearchTableComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  _nonApplications: NonApplicationSearchResultDto[] = [];
  @Input() set nonApplications(nonApplications: NonApplicationSearchResultDto[]) {
    this._nonApplications = nonApplications;
    this.dataSource = this.mapNonApplications(nonApplications);
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

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'type', 'applicant', 'government'];
  dataSource: NonApplicationSearchResultDto[] = [];
  pageIndex = 0;
  itemsPerPage = 20;
  total = 0;
  sortDirection = 'DESC';
  sortField = 'fileId';

  COVENANT_TYPE_LABEL = COVENANT_TYPE_LABEL;
  PLANNING_TYPE_LABEL = PLANNING_TYPE_LABEL;

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
      tableType: 'NONAPP',
    });
  }

  async onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    await this.onTableChange();
  }

  async onSelectRecord(record: SearchResult) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/board/${record.board}`], {
        queryParams: { card: record.referenceId, type: record.class },
      })
    );

    window.open(url, '_blank');
  }

  private mapNonApplications(nonApplications: NonApplicationSearchResultDto[]): NonApplicationSearchResultDto[] {
    return nonApplications.map((e) => {
      return {
        fileNumber: e.fileNumber,
        type: e.type,
        applicant: e.applicant,
        boardCode: e.boardCode,
        localGovernmentName: e.localGovernmentName,
        referenceId: e.referenceId,
        board: e.boardCode,
        class: e.class,
      };
    });
  }
}
