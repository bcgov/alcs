import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationStatusDto } from '../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationService } from '../../services/application/application.service';
import { AdvancedSearchResultDto, SearchRequestDto } from '../../services/search/search.dto';
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
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  $destroy = new Subject<void>();

  isSearchExpanded = true;

  searchResults: SearchResult[] = [];
  displayedColumns = ['fileId', 'dateSubmitted', 'ownerName', 'type', 'government', 'portalStatus'];
  pageIndex = 0;
  itemsPerPage = 20;
  applicationsTotal: number = 0;

  localGovernmentControl = new FormControl<string | undefined>(undefined);
  portalStatusControl = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl<string | undefined>(undefined),
    name: new FormControl<string | undefined>(undefined),
    pid: new FormControl<string | undefined>(undefined),
    civicAddress: new FormControl<string | undefined>(undefined),
    isIncludeOtherParcels: new FormControl(false),
    resolutionNumber: new FormControl<string | undefined>(undefined),
    resolutionYear: new FormControl<number | undefined>(undefined),
    legacyId: new FormControl<string | undefined>(undefined),
    portalStatus: this.portalStatusControl,
    componentType: new FormControl<string | undefined>(undefined),
    government: this.localGovernmentControl,
    region: new FormControl<string | undefined>(undefined),
    dateSubmittedFrom: new FormControl(undefined),
    dateSubmittedTo: new FormControl(undefined),
    dateDecidedFrom: new FormControl(undefined),
    dateDecidedTo: new FormControl(undefined),
  });

  resolutionYears: number[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<ApplicationLocalGovernmentDto[]>;
  regions: ApplicationRegionDto[] = [];
  statuses: ApplicationStatusDto[] = [];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.setup();

    this.applicationService.$applicationRegions
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.applicationService.$applicationStatuses, this.activatedRoute.queryParamMap))
      .subscribe(([regions, statuses, queryParamMap]) => {
        this.regions = regions;
        this.statuses = statuses;

        const searchText = queryParamMap.get('searchText');

        if (searchText) {
          this.searchForm.controls.fileNumber.setValue(searchText);

          this.searchService
            .advancedSearchFetch({
              fileNumber: searchText,
              isIncludeOtherParcels: false,
              pageSize: this.itemsPerPage,
              page: this.pageIndex + 1,
              sortDirection: this.sortDirection,
              sortField: this.sortField,
            })
            .then((result) => (this.searchResults = this.mapSearchResults(result)));
        }
      });
  }

  private setup() {
    const year = moment('1950');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
    this.loadGovernments();
    this.applicationService.setup();

    this.filteredLocalGovernments = this.localGovernmentControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterLocalGovernment(value || ''))
    );
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

  private mapSearchResults(searchResult?: AdvancedSearchResultDto) {
    if (!searchResult) {
      searchResult = {
        data: [],
        total: 0,
      };
    }

    this.applicationsTotal = searchResult.total;

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
        this.localGovernmentControl.setValue(localGovernment.name);
      }
    }
  }

  onBlur() {
    //Blur will fire before onChange above, so use setTimeout to delay it
    setTimeout(() => {
      const localGovernmentName = this.localGovernmentControl.getRawValue();
      if (localGovernmentName) {
        const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
        if (!localGovernment) {
          this.localGovernmentControl.setValue(null);
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
    const result = await this.searchService.advancedSearchFetch(searchParams);
    this.searchResults = this.mapSearchResults(result);
  }

  getSearchParams() {
    return {
      // pagination
      pageSize: this.itemsPerPage,
      page: this.pageIndex + 1,
      // sorting
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      // TODO move condition into helper function?
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  sortDirection = 'DESC';
  sortField = 'dateSubmitted';

  ngAfterViewInit() {
    this.sort.sortChange.pipe(takeUntil(this.$destroy)).subscribe(async (sortObj) => {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.sortDirection = sortObj.direction.toUpperCase();
      this.sortField = sortObj.active;

      await this.onSearch();
    });
  }
}
