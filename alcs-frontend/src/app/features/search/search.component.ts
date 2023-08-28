import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationStatusDto } from '../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationService } from '../../services/application/application.service';
import { SearchRequestDto, SearchResultDto } from '../../services/search/search.dto';
import { SearchService } from '../../services/search/search.service';
import { ToastService } from '../../services/toast/toast.service';
import { ApplicationSubmissionStatusPill } from '../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { formatDateForApi } from '../../shared/utils/api-date-formatter';

interface SearchResult {
  fileNumber: string;
  dateSubmitted: number;
  ownerName: string;
  type?: ApplicationTypeDto;
  government?: string;
  portalStatus?: string;
  referenceId: string;
  board?: string;
  class: string;
  status?: ApplicationSubmissionStatusPill;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  searchText?: string;

  searchResults: SearchResult[] = [];
  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'portalStatus'];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    const year = moment('1950');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
    this.loadGovernments();
    this.applicationService.setup();

    this.filteredLocalGovernments = this.localGovernment.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterLocalGovernment(value || ''))
    );

    this.applicationService.$applicationRegions
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.applicationService.$applicationStatuses, this.activatedRoute.queryParamMap))
      .subscribe(([regions, statuses, queryParamMap]) => {
        this.regions = regions;
        this.statuses = statuses;

        const searchText = queryParamMap.get('searchText');

        if (searchText) {
          this.searchText = searchText;

          this.searchService
            .fetch({
              fileNumber: searchText,
              isIncludeOtherParcels: false,
              pageSize: this.itemsPerPage,
              page: this.pageIndex,
            })
            .then((result) => (this.searchResults = this.mapSearchResults(result)));
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSelectCard(record: SearchResult) {
    switch (record.class) {
      case 'APP':
        await this.router.navigateByUrl(`/application/${record.referenceId}`);
        break;
      case 'NOI':
        await this.router.navigateByUrl(`/notice-of-intent/${record.referenceId}`);
        break;
      case 'COV':
      case 'PLAN':
        await this.router.navigateByUrl(`/board/${record.board}?card=${record.referenceId}&type=${record.type}`);
        break;
      default:
        this.toastService.showErrorToast(`Unable to navigate to ${record.referenceId}`);
    }
  }

  // new search functionality

  private mapSearchResults(searchResult?: SearchResultDto) {
    if (!searchResult) {
      searchResult = {
        data: [],
        total: 0,
      };
    }

    this.total = searchResult.total;

    return searchResult.data.map((e) => {
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
          backgroundColor: status?.portalBackgroundColor,
          textColor: status?.portalColor,
          borderColor: status?.portalBackgroundColor,
          label: status?.label,
          shortLabel: status?.label,
        } as ApplicationSubmissionStatusPill,
      };
    });
  }

  localGovernment = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl(undefined),
    name: new FormControl(undefined),
    pid: new FormControl(undefined),
    civicAddress: new FormControl(undefined),
    isIncludeOtherParcels: new FormControl(false),
    resolutionNumber: new FormControl<string | undefined>(undefined),
    resolutionYear: new FormControl<number | undefined>(undefined),
    legacyId: new FormControl(undefined),
    portalStatus: new FormControl(undefined),
    componentType: new FormControl(undefined),
    government: this.localGovernment,
    region: new FormControl(undefined),
    dateSubmittedFrom: new FormControl(undefined),
    dateSubmittedTo: new FormControl(undefined),
    dateDecidedFrom: new FormControl(undefined),
    dateDecidedTo: new FormControl(undefined),
  });

  isSearchExpanded = true;
  resolutionYears: number[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<ApplicationLocalGovernmentDto[]>;
  regions: ApplicationRegionDto[] = [];
  statuses: ApplicationStatusDto[] = [];

  pageIndex = 0;
  itemsPerPage = 20;
  total: number = 0;

  onSubmit() {
    console.log('onSubmit');
  }

  expandSearchClicked() {
    this.isSearchExpanded = !this.isSearchExpanded;
  }

  private async loadGovernments() {
    const governments = await this.localGovernmentService.list();
    this.localGovernments = governments.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  private filterLocalGovernment(value: string): ApplicationLocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  onGovernmentChange($event: MatAutocompleteSelectedEvent) {
    const localGovernmentName = $event.option.value;
    if (localGovernmentName) {
      const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
      if (localGovernment) {
        this.localGovernment.setValue(localGovernment.name);
      }
    }
  }

  onBlur() {
    //Blur will fire before onChange above, so use setTimeout to delay it
    setTimeout(() => {
      const localGovernmentName = this.localGovernment.getRawValue();
      if (localGovernmentName) {
        const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
        if (!localGovernment) {
          this.localGovernment.setValue(null);
          console.log('Clearing Local Government field');
        }
      }
    }, 500);
  }

  onReset() {
    this.searchForm.reset();
  }

  async onSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.fetch(searchParams);
    this.searchResults = this.mapSearchResults(result);
  }

  getSearchParams() {
    return {
      pageSize: this.itemsPerPage,
      page: this.pageIndex + 1,
      // TODO move condition into helper function
      fileNumber:
        this.searchForm.controls.fileNumber.value && this.searchForm.controls.fileNumber.value !== ''
          ? this.searchForm.controls.fileNumber.value
          : undefined,
      legacyId: this.searchForm.controls.legacyId.value ?? undefined,
      name: this.searchForm.controls.name.value ?? undefined,
      civicAddress: this.searchForm.controls.civicAddress.value ?? undefined,
      pid: this.searchForm.controls.pid.value ?? undefined,
      isIncludeOtherParcels: this.searchForm.controls.isIncludeOtherParcels.value ?? false,
      resolutionNumber: this.searchForm.controls.resolutionNumber.value
        ? parseInt(this.searchForm.controls.resolutionNumber.value)
        : undefined,
      resolutionYear: this.searchForm.controls.resolutionYear.value ?? undefined,
      portalStatusCode: this.searchForm.controls.portalStatus.value ?? undefined,
      governmentName: this.searchForm.controls.government.value ?? undefined,
      regionCode: this.searchForm.controls.region.value ?? undefined,
      dateSubmittedFrom: this.searchForm.controls.dateSubmittedFrom.value
        ? formatDateForApi(this.searchForm.controls.dateSubmittedFrom.value)
        : undefined,
      dateSubmittedTo: this.searchForm.controls.dateSubmittedTo.value
        ? formatDateForApi(this.searchForm.controls.dateSubmittedTo.value)
        : undefined,
      dateDecidedFrom: this.searchForm.controls.dateDecidedFrom.value
        ? formatDateForApi(this.searchForm.controls.dateDecidedFrom.value)
        : undefined,
      dateDecidedTo: this.searchForm.controls.dateDecidedTo.value
        ? formatDateForApi(this.searchForm.controls.dateDecidedTo.value)
        : undefined,
    } as SearchRequestDto;
  }

  onPageChange($event: PageEvent) {
    this.pageIndex = $event.pageIndex;
    this.itemsPerPage = $event.pageSize;

    this.onSearch();
  }
}
