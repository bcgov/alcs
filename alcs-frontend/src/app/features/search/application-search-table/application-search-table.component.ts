import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSearchResultDto } from '../../../services/search/search.dto';
import { ApplicationSubmissionStatusPill } from '../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { defaultStatusBackgroundColour, defaultStatusColour } from '../search.component';
import { TableChange } from '../search.interface';

interface SearchResult {
  fileNumber: string;
  dateSubmitted: number;
  ownerName: string;
  type?: ApplicationTypeDto;
  localGovernmentName?: string;
  portalStatus?: string;
  referenceId: string;
  board?: string;
  class: string;
  status?: ApplicationSubmissionStatusPill;
}

@Component({
  selector: 'app-application-search-table',
  templateUrl: './application-search-table.component.html',
  styleUrls: ['./application-search-table.component.scss'],
})
export class ApplicationSearchTableComponent implements OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  _applications: ApplicationSearchResultDto[] = [];
  @Input() set applications(applications: ApplicationSearchResultDto[]) {
    this._applications = applications;
    this.dataSource = this.mapApplications(applications);
  }
  @Input() pageIndex: number = 0;

  _totalCount = 0;
  @Input() set totalCount(count: number) {
    this._totalCount = count;

    // this will ensure the reset of subscriber once the table is hidden because of empty
    this.initSorting();
  }

  @Input() statuses: ApplicationStatusDto[] = [];
  @Input() regions: ApplicationRegionDto[] = [];

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'portalStatus'];
  dataSource: SearchResult[] = [];
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
    const url = this.router.serializeUrl(this.router.createUrlTree([`/application/${record.referenceId}`]));

    window.open(url, '_blank');
  }

  private mapApplications(applications: ApplicationSearchResultDto[]): SearchResult[] {
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
          backgroundColor: status?.portalBackgroundColor ?? defaultStatusBackgroundColour,
          textColor: status?.portalColor ?? defaultStatusColour,
          borderColor: status?.portalBackgroundColor,
          label: status?.label,
          shortLabel: status?.label,
        },
      };
    });
  }

  private initSorting() {
    if (this._totalCount <= 0) {
      this.subscribedToSort = false;
    }

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
}
