import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
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
  status?: ApplicationSubmissionStatusPill | null;
}

@Component({
  selector: 'app-application-search-table',
  templateUrl: './application-search-table.component.html',
  styleUrls: ['./application-search-table.component.scss'],
})
export class ApplicationSearchTableComponent {
  _applications: ApplicationSearchResultDto[] = [];
  @Input() set applications(applications: ApplicationSearchResultDto[]) {
    this._applications = applications;
    this.dataSource = this.mapApplications(applications);
    this.isLoading = false;
  }
  @Input() pageIndex: number = 0;
  @Input() totalCount: number | undefined;
  @Input() statuses: ApplicationStatusDto[] = [];
  @Input() regions: ApplicationRegionDto[] = [];
  @Input() isCommissioner: boolean = false;

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'status'];
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
      tableType: 'APP',
    });
  }

  onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.onTableChange();
  }

  onSelectRecord(record: SearchResult) {
    const decisionUrl = record.status?.label === 'Decision Released' ? '/decision' : '';
    const url = this.isCommissioner
      ? this.router.serializeUrl(this.router.createUrlTree([`/commissioner/application/${record.referenceId}`]))
      : this.router.serializeUrl(this.router.createUrlTree([`/application/${record.referenceId}${decisionUrl}`]));

    window.open(url, '_blank');
  }

  onSortChange(sort: Sort) {
    this.pageIndex = 0;
    this.sortDirection = sort.direction;
    this.sortField = sort.active;
    this.onTableChange();
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
        referenceId: e.referenceId,
        board: e.boardCode,
        class: e.class,
        status: status ? {
          backgroundColor: status.portalBackgroundColor ?? defaultStatusBackgroundColour,
          textColor: status.portalColor ?? defaultStatusColour,
          borderColor: status.portalBackgroundColor,
          label: status.label,
          shortLabel: status.label,
        } : null,
      };
    });
  }
}
