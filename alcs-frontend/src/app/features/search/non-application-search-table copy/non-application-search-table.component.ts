import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NonApplicationSearchResultDto } from '../../../services/search/search.dto';
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
export class NonApplicationSearchTableComponent implements AfterViewInit, OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  _planningReviews: NonApplicationSearchResultDto[] = [];
  @Input() set planningReviews(planningReviews: NonApplicationSearchResultDto[]) {
    this._planningReviews = planningReviews;
    this.dataSource = this.mapNonApplications(planningReviews);
  }

  @Input() totalCount = 0;
  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'applicant', 'government'];
  dataSource: NonApplicationSearchResultDto[] = [];
  pageIndex = 0;
  itemsPerPage = 20;
  total = 0;
  sortDirection = 'DESC';
  sortField = 'fileId';

  constructor(private router: Router) {}

  ngAfterViewInit() {
    if (this.sort) {
      this.sort.sortChange.pipe(takeUntil(this.$destroy)).subscribe(async (sortObj) => {
        this.paginator.pageIndex = 0;
        this.pageIndex = 0;
        this.sortDirection = sortObj.direction.toUpperCase();
        this.sortField = sortObj.active;

        await this.onTableChange();
      });
    }
  }

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
    await this.router.navigateByUrl(`/application/${record.referenceId}`);
  }

  private mapNonApplications(nonApplications: NonApplicationSearchResultDto[]): NonApplicationSearchResultDto[] {
    return nonApplications.map((e) => {
      return {
        fileNumber: e.fileNumber,
        localGovernmentName: e.localGovernmentName,
        referenceId: e.referenceId,
        boardCode: e.boardCode,
        type: e.class,
        applicant: e.applicant,
        class: e.class,
      };
    });
  }
}
