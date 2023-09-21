import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationStatusDto } from '../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationService } from '../../services/application/application.service';
import { NoticeOfIntentStatusDto } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NotificationSubmissionStatusService } from '../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationSubmissionStatusDto } from '../../services/notification/notification.dto';
import {
  AdvancedSearchResponseDto,
  ApplicationSearchResultDto,
  NonApplicationSearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  SearchRequestDto,
} from '../../services/search/search.dto';
import { SearchService } from '../../services/search/search.service';
import { ToastService } from '../../services/toast/toast.service';
import { formatDateForApi } from '../../shared/utils/api-date-formatter';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down/file-type-filter-drop-down.component';
import { TableChange } from './search.interface';

export const defaultStatusBackgroundColour = '#ffffff';
export const defaultStatusColour = '#313132';

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

  notifications: NotificationSearchResultDto[] = [];
  notificationTotal = 0;

  isSearchExpanded = false;
  pageIndex = 0;
  itemsPerPage = 20;
  sortDirection = 'DESC';
  sortField = 'dateSubmitted';

  localGovernmentControl = new FormControl<string | undefined>(undefined);
  portalStatusControl = new FormControl<string | undefined>(undefined);
  componentTypeControl = new FormControl<string[] | undefined>(undefined);
  pidControl = new FormControl<string | undefined>(undefined);
  nameControl = new FormControl<string | undefined>(undefined);
  civicAddressControl = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl<string | undefined>(undefined),
    name: this.nameControl,
    pid: this.pidControl,
    civicAddress: this.civicAddressControl,
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
  applicationStatuses: ApplicationStatusDto[] = [];
  allStatuses: (ApplicationStatusDto | NoticeOfIntentStatusDto | NotificationSubmissionStatusDto)[] = [];

  formEmpty = true;
  civicAddressInvalid = false;
  pidInvalid = false;
  searchResultsHidden = true;
  notificationStatuses: NotificationSubmissionStatusDto[] = [];
  noiStatuses: NoticeOfIntentStatusDto[] = [];

  constructor(
    private searchService: SearchService,
    private activatedRoute: ActivatedRoute,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private notificationStatusService: NotificationSubmissionStatusService,
    private noiStatusService: NoticeOfIntentSubmissionStatusService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private titleService: Title
  ) {
    this.titleService.setTitle('ALCS | Search');
  }

  ngOnInit(): void {
    this.setup();

    this.applicationService.$applicationRegions
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.applicationService.$applicationStatuses, this.activatedRoute.queryParamMap))
      .subscribe(([regions, statuses, queryParamMap]) => {
        this.regions = regions;
        this.applicationStatuses = statuses;
        this.populateAllStatuses();

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
              fileTypes: [],
            })
            .then((result) => {
              this.searchResultsHidden = false;
              this.mapSearchResults(result);
            });
        }
      });

    this.searchForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
      let isEmpty = true;
      for (let key in this.searchForm.controls) {
        let value = this.searchForm.controls[key as keyof typeof this.searchForm.controls].value;
        if (value && !(Array.isArray(value) && value.length === 0)) {
          isEmpty = false;
          break;
        }
      }
      this.formEmpty = isEmpty;
    });

    this.civicAddressControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.civicAddressInvalid =
        this.civicAddressControl.invalid && (this.civicAddressControl.dirty || this.civicAddressControl.touched);
    });

    this.pidControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.pidInvalid = this.pidControl.invalid && (this.pidControl.dirty || this.pidControl.touched);
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
    this.loadStatuses();

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
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchFetch(searchParams);
    this.searchResultsHidden = false;

    // push tab activation to next render cycle, after the tabGroup is rendered
    setTimeout(() => {
      this.mapSearchResults(result);

      this.setActiveTab();
    });
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

    if (this.fileTypeFilterDropDownComponent) {
      this.fileTypeFilterDropDownComponent.reset();
    }
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
      fileTypes: this.searchForm.controls.componentType.value ? this.searchForm.controls.componentType.value : [],
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

  async onNotificationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchNotificationsFetch(searchParams);

    this.notifications = result?.data ?? [];
    this.notificationTotal = result?.total ?? 0;
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
        await this.onNoticeOfIntentSearch();
        break;
      case 'NONAPP':
        await this.onNonApplicationSearch();
        break;
      case 'NOTI':
        await this.onNotificationSearch();
        break;
      default:
        this.toastService.showErrorToast('Not implemented');
    }
  }

  onFileTypeChange(fileTypes: string[]) {
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
        notifications: [],
        totalApplications: 0,
        totalNoticeOfIntents: 0,
        totalNonApplications: 0,
        totalNotifications: 0,
      };
    }

    this.applicationTotal = searchResult.totalApplications;
    this.applications = searchResult.applications;

    this.noticeOfIntentTotal = searchResult.totalNoticeOfIntents;
    this.noticeOfIntents = searchResult.noticeOfIntents;

    this.nonApplicationsTotal = searchResult.totalNonApplications;
    this.nonApplications = searchResult.nonApplications;

    this.notifications = searchResult.notifications;
    this.notificationTotal = searchResult.totalNotifications;
  }

  private setActiveTab() {
    //Keep this in Tab Order
    const searchCounts = [
      this.applicationTotal,
      this.noticeOfIntentTotal,
      this.nonApplicationsTotal,
      this.notificationTotal,
    ];

    this.tabGroup.selectedIndex = searchCounts.indexOf(Math.max(...searchCounts));
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

  private async loadStatuses() {
    this.notificationStatuses = await this.notificationStatusService.list();
    this.noiStatuses = await this.noiStatusService.listStatuses();
    this.populateAllStatuses();
  }

  private populateAllStatuses() {
    const statusCodes = new Set<string>();
    const result = [];
    const allStatuses = [...this.applicationStatuses, ...this.noiStatuses, ...this.notificationStatuses];
    for (const status of allStatuses) {
      if (!statusCodes.has(status.code)) {
        result.push(status);
        statusCodes.add(status.code);
      }
    }

    this.allStatuses = result;
    this.allStatuses.sort((a, b) => (a.label > b.label ? 1 : -1));
  }
}
