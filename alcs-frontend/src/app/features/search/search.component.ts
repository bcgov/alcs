import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationStatusDto } from '../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationService } from '../../services/application/application.service';
import {
  AdvancedSearchResponseDto,
  ApplicationSearchResultDto,
  NonApplicationSearchResultDto,
  NoticeOfIntentSearchResultDto,
  SearchRequestDto,
} from '../../services/search/search.dto';
import { SearchService } from '../../services/search/search.service';
import { ToastService } from '../../services/toast/toast.service';
import { formatDateForApi } from '../../shared/utils/api-date-formatter';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down/file-type-filter-drop-down.component';
import { TableChange } from './search.interface';

export const defaultStatusBackgroundColour = '#ffffff';
export const defaultStatusColour = '#313132';

const APPLICATION_TAB_INDEX = 0;
const NOTICE_OF_INTENT_TAB_INDEX = 1;
const NON_APPLICATION_TAB_INDEX = 2;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild('searchResultTabs') tabGroup!: MatTabGroup;
  @ViewChild('fileTypeDropDown') fileTypeFilterDropDownComponent!: FileTypeFilterDropDownComponent;

  applications: ApplicationSearchResultDto[] = [];
  applicationTotal = 0;

  noticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
  noticeOfIntentTotal = 0;

  nonApplications: NonApplicationSearchResultDto[] = [];
  nonApplicationsTotal = 0;

  isSearchExpanded = false;
  pageIndex = 0;
  itemsPerPage = 20;
  sortDirection = 'DESC';
  sortField = 'dateSubmitted';

  localGovernmentControl = new FormControl<string | undefined>(undefined);
  portalStatusControl = new FormControl<string | undefined>(undefined);
  componentTypeControl = new FormControl<string[] | undefined>(undefined);
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
    componentType: this.componentTypeControl,
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
    private activatedRoute: ActivatedRoute,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService,
    private toastService: ToastService
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
              applicationFileTypes: [],
            })
            .then((result) => this.mapSearchResults(result));
        }
      });
  }

  private setup() {
    const startingYear = moment('1950');
    const currentYear = moment().year();
    while (startingYear.year() <= currentYear) {
      this.resolutionYears.push(startingYear.year());
      startingYear.add(1, 'year');
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

  async onSubmit() {
    await this.onSearch();
  }

  expandSearchClicked() {
    this.isSearchExpanded = !this.isSearchExpanded;
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
    //Blur will fire before onGovernmentChange above, so use setTimeout to delay it
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
    this.fileTypeFilterDropDownComponent.reset();
  }

  async onSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchFetch(searchParams);
    this.mapSearchResults(result);

    this.setActiveTab();
  }

  getSearchParams(): SearchRequestDto {
    const resolutionNumberString = this.formatStringSearchParam(this.searchForm.controls.resolutionNumber.value);
    return {
      // pagination
      pageSize: this.itemsPerPage,
      page: this.pageIndex + 1,
      // sorting
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      // search parameters
      fileNumber: this.formatStringSearchParam(this.searchForm.controls.fileNumber.value),
      legacyId: this.formatStringSearchParam(this.searchForm.controls.legacyId.value),
      name: this.formatStringSearchParam(this.searchForm.controls.name.value),
      civicAddress: this.formatStringSearchParam(this.searchForm.controls.civicAddress.value),
      pid: this.formatStringSearchParam(this.searchForm.controls.pid.value),
      isIncludeOtherParcels: this.searchForm.controls.isIncludeOtherParcels.value ?? false,
      resolutionNumber: resolutionNumberString ? parseInt(resolutionNumberString) : undefined,
      resolutionYear: this.searchForm.controls.resolutionYear.value ?? undefined,
      portalStatusCode: this.searchForm.controls.portalStatus.value ?? undefined,
      governmentName: this.formatStringSearchParam(this.searchForm.controls.government.value),
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
      applicationFileTypes: this.searchForm.controls.componentType.value
        ? this.searchForm.controls.componentType.value
        : [],
    };
  }

  async onApplicationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchApplicationsFetch(searchParams);

    this.applications = result?.data ?? [];
    this.applicationTotal = result?.total ?? 0;
  }

  async onNoticeOfIntentSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchNoticeOfIntentsFetch(searchParams);

    this.noticeOfIntents = result?.data ?? [];
    this.noticeOfIntentTotal = result?.total ?? 0;
  }

  async onNonApplicationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchNonApplicationsFetch(searchParams);

    this.nonApplications = result?.data ?? [];
    this.nonApplicationsTotal = result?.total ?? 0;
  }

  async onTableChange(event: TableChange) {
    this.pageIndex = event.pageIndex;
    this.itemsPerPage = event.itemsPerPage;
    this.sortDirection = event.sortDirection;
    this.sortField = event.sortField;

    switch (event.tableType) {
      case 'APP':
        await this.onApplicationSearch();
        break;
      case 'NOI':
        await this.onApplicationSearch();
        break;
      case 'NONAPP':
        await this.onNonApplicationSearch();
        break;
      default:
        this.toastService.showErrorToast('Not implemented');
    }
  }

  onFileTypeChange(fileTypes: string[]) {
    console.log('search -> onFileTypeChange', fileTypes);
    this.componentTypeControl.setValue(fileTypes);
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

  private mapSearchResults(searchResult?: AdvancedSearchResponseDto) {
    if (!searchResult) {
      searchResult = {
        applications: [],
        noticeOfIntents: [],
        nonApplications: [],
        totalApplications: 0,
        totalNoticeOfIntents: 0,
        totalNonApplications: 0,
      };
    }

    this.applicationTotal = searchResult.totalApplications;
    this.applications = searchResult.applications;

    this.noticeOfIntentTotal = searchResult.totalNoticeOfIntents;
    this.noticeOfIntents = searchResult.noticeOfIntents;

    this.nonApplicationsTotal = searchResult.totalNonApplications;
    this.nonApplications = searchResult.nonApplications;
  }

  private setActiveTab() {
    let maxVal = Math.max(this.applicationTotal, this.noticeOfIntentTotal, this.nonApplicationsTotal);
    this.tabGroup.selectedIndex =
      maxVal === this.applicationTotal
        ? APPLICATION_TAB_INDEX
        : maxVal === this.noticeOfIntentTotal
        ? NOTICE_OF_INTENT_TAB_INDEX
        : NON_APPLICATION_TAB_INDEX;
  }

  private formatStringSearchParam(value: string | undefined | null) {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (value.trim() === '') {
      return undefined;
    } else {
      return value.trim();
    }
  }
}
