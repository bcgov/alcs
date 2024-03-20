import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { PlanningReviewSearchResultDto } from '../../../services/search/search.dto';
import { CLOSED_PR_LABEL, OPEN_PR_LABEL } from '../../../shared/application-type-pill/application-type-pill.constants';
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
  selector: 'app-planning-review-search-table',
  templateUrl: './planning-review-search-table.component.html',
  styleUrls: ['./planning-review-search-table.component.scss'],
})
export class PlanningReviewSearchTableComponent {
  _planningReviews: PlanningReviewSearchResultDto[] = [];
  @Input() set planningReviews(planningReviews: PlanningReviewSearchResultDto[]) {
    this._planningReviews = planningReviews;
    this.isLoading = false;
    this.dataSource = planningReviews;
  }

  OPEN_TYPE = OPEN_PR_LABEL;
  CLOSED_TYPE = CLOSED_PR_LABEL;

  @Input() totalCount: number | undefined;
  @Input() pageIndex: number = 0;

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'type', 'applicant', 'government', 'status'];
  dataSource: PlanningReviewSearchResultDto[] = [];

  itemsPerPage = 20;
  total = 0;
  sortDirection: SortDirection = 'desc';
  sortField = 'fileId';
  isLoading = false;

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
    this.onTableChange();
  }

  onSelectRecord(record: SearchResult) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/board/${record.board}`], {
        queryParams: { card: record.referenceId, type: record.class },
      }),
    );

    window.open(url, '_blank');
  }
}
