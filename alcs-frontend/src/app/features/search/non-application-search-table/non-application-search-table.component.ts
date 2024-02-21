import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
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
export class NonApplicationSearchTableComponent {
  _nonApplications: NonApplicationSearchResultDto[] = [];
  @Input() set nonApplications(nonApplications: NonApplicationSearchResultDto[]) {
    this._nonApplications = nonApplications;
    this.isLoading = false;
    this.dataSource = this.mapNonApplications(nonApplications);
  }

  @Input() totalCount: number | undefined;
  @Input() pageIndex: number = 0;

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'type', 'applicant', 'government'];
  dataSource: NonApplicationSearchResultDto[] = [];

  itemsPerPage = 20;
  total = 0;
  sortDirection: SortDirection = 'desc';
  sortField = 'fileId';
  isLoading = false;

  COVENANT_TYPE_LABEL = COVENANT_TYPE_LABEL;
  PLANNING_TYPE_LABEL = PLANNING_TYPE_LABEL;

  constructor(private router: Router) {}

  onTableChange() {
    this.isLoading = true;
    this.tableChange.emit({
      pageIndex: this.pageIndex,
      itemsPerPage: this.itemsPerPage,
      sortDirection: this.sortDirection,
      sortField: this.sortField,
      tableType: 'NONAPP',
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
  }

  onSelectRecord(record: SearchResult) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/board/${record.board}`], {
        queryParams: { card: record.referenceId, type: record.class },
      }),
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
