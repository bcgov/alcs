import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementSearchResultDto } from '../../../services/search/search.dto';
import {
  CLOSED_PR_LABEL,
  DRAFT_DECISION_TYPE_LABEL,
  OPEN_PR_LABEL,
} from '../../../shared/application-type-pill/application-type-pill.constants';
import { TableChange } from '../search.interface';

interface SearchResult {
  fileNumber: string;
  applicant: string;
  dateSubmitted: string;
  localGovernmentName?: string;
  cAndEFileUuid: string;
  board?: string;
  class: string;
}

@Component({
  selector: 'app-c-and-e-file-search-table',
  templateUrl: './c-and-e-file-search-table.component.html',
  styleUrls: ['./c-and-e-file-search-table.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementSearchTableComponent {
  _cAndEFiles: ComplianceAndEnforcementSearchResultDto[] = [];
  @Input() set cAndEFiles(cAndEFiles: ComplianceAndEnforcementSearchResultDto[]) {
    this._cAndEFiles = cAndEFiles;
    this.isLoading = false;
    this.dataSource = cAndEFiles;
  }

  OPEN_TYPE = OPEN_PR_LABEL;
  CLOSED_TYPE = CLOSED_PR_LABEL;
  DRAFT_DECISION_TYPE_LABEL = DRAFT_DECISION_TYPE_LABEL;

  @Input() totalCount: number | undefined;
  @Input() pageIndex: number = 0;

  @Output() tableChange = new EventEmitter<TableChange>();

  displayedColumns = ['fileId', 'dateSubmitted', 'civicAddress', 'responsibleParties', 'localGovernmentName', 'status'];
  dataSource: ComplianceAndEnforcementSearchResultDto[] = [];

  itemsPerPage = 20;
  total = 0;
  sortDirection: SortDirection = 'desc';
  sortField = 'dateSubmitted';
  isLoading = false;

  constructor(
    private router: Router,
    private readonly cAndEService: ComplianceAndEnforcementService,
  ) {}

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
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/compliance-and-enforcement/${record.fileNumber}`]),
    );

    window.open(url, '_blank');
  }

  propertyOwnerName(record: ComplianceAndEnforcementSearchResultDto): string | undefined {
    return this.cAndEService.propertyOwnerName(record.isCrown, record.responsibleParties || []);
  }
}
