import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InquirySearchResultDto } from '../../../services/search/search.dto';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { CLOSED_PR_LABEL, OPEN_PR_LABEL } from '../../../shared/application-type-pill/application-type-pill.constants';
import { TableChange } from '../search.interface';

interface SearchResult {
  fileNumber: string;
  applicant: string;
  dateSubmitted: string;
  localGovernmentName?: string;
  inquiryUuid: string;
  board?: string;
  class: string;
}

@Component({
  selector: 'app-inquiry-search-table',
  templateUrl: './inquiry-search-table.component.html',
  styleUrls: ['./inquiry-search-table.component.scss'],
})
export class InquirySearchTableComponent {
  _planningReviews: InquirySearchResultDto[] = [];
  @Input() set inquiries(inquiries: InquirySearchResultDto[]) {
    this._planningReviews = inquiries;
    this.isLoading = false;
    this.dataSource = inquiries;
  }

  OPEN_TYPE = OPEN_PR_LABEL;
  CLOSED_TYPE = CLOSED_PR_LABEL;

  @Input() totalCount: number | undefined;
  @Input() pageIndex: number = 0;

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'dateSubmitted', 'applicant', 'type', 'government', 'status'];
  dataSource: InquirySearchResultDto[] = [];

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
      tableType: 'INQR',
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
    const url = this.router.serializeUrl(this.router.createUrlTree([`/inquiry/${record.fileNumber}`]));

    window.open(url, '_blank');
  }
}
