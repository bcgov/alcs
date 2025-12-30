import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApplicationStatusDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSearchResultDto, displayedColumns } from '../../../../services/search/search.dto';
import { SearchResult, TableChange } from '../search.interface';

@Component({
    selector: 'app-application-search-table',
    templateUrl: './application-search-table.component.html',
    styleUrls: ['./application-search-table.component.scss'],
    standalone: false
})
export class ApplicationSearchTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @Input() pageIndex: number = 0;
  @Input() totalCount: number | undefined;

  _applications!: ApplicationSearchResultDto[];
  @Input() set applications(applications: ApplicationSearchResultDto[]) {
    this._applications = applications;
    this.isLoading = false;
    this.mapApplications();
  }

  _statuses!: ApplicationStatusDto[];
  @Input() set statuses(statuses: ApplicationStatusDto[]) {
    this._statuses = statuses;
    this.mapApplications();
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
      tableType: 'APP',
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
    await this.router.navigateByUrl(`/public/application/${record.referenceId}`);
  }

  private mapApplications() {
    if (!this._applications || !this._statuses) {
      return;
    }
    const results = this._applications.map((e) => {
      const status = this._statuses.find((st) => st.code === e.status);

      return {
        ...e,
        status,
      };
    });
    this.dataSource = new MatTableDataSource<SearchResult>(results);
  }
}
