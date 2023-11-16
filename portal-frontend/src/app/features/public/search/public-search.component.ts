import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ApplicationStatusDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationRegionDto, DecisionMakerDto, LocalGovernmentDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';
import {
  ApplicationSearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  SearchRequestDto,
  SearchResponseDto,
} from '../../../services/search/search.dto';
import { SearchService } from '../../../services/search/search.service';
import { StatusService } from '../../../services/status/status.service';
import { ToastService } from '../../../services/toast/toast.service';
import { MOBILE_BREAKPOINT } from '../../../shared/utils/breakpoints';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down/file-type-filter-drop-down.component';
import { TableChange } from './search.interface';

const STATUS_MAP = {
  'Received by ALC': 'RECA',
  'Under Review by ALC': 'REVA',
  'Decision Released': 'ALCD',
  'ALC Response Sent (SRW only)': 'ALCR',
};

const DECISION_MAP = {
  'Approved': 'APPR',
  'Refused': 'REFU',
  'Rescinded': 'RESC',
  'Ordered not to Proceed (NOI)': 'ONTP',
};

const SEARCH_SESSION_STORAGE_KEY = 'search';

@Component({
  selector: 'app-public',
  templateUrl: './public-search.component.html',
  styleUrls: ['./public-search.component.scss'],
})
export class PublicSearchComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild('searchResultTabs') tabGroup!: MatTabGroup;
  @ViewChild('fileTypeDropDown') fileTypeFilterDropDownComponent!: FileTypeFilterDropDownComponent;

  applications: ApplicationSearchResultDto[] = [];
  applicationTotal = 0;

  noticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
  noticeOfIntentTotal = 0;

  notifications: NotificationSearchResultDto[] = [];
  notificationTotal = 0;
  outcome = '';

  pageIndex = 0;
  itemsPerPage = 20;
  sortDirection = 'DESC';
  sortField = 'dateSubmitted';

  localGovernmentControl = new FormControl<string | undefined>(undefined);
  portalStatusControl = new FormControl<string[]>([]);
  portalDecisionOutcomeControl = new FormControl<string[]>([]);
  componentTypeControl = new FormControl<string[] | undefined>(undefined);
  pidControl = new FormControl<string | undefined>(undefined);
  nameControl = new FormControl<string | undefined>(undefined);
  civicAddressControl = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl<string | undefined>(undefined),
    name: this.nameControl,
    pid: this.pidControl,
    civicAddress: this.civicAddressControl,
    portalStatus: this.portalStatusControl,
    portalDecisionOutcome: this.portalDecisionOutcomeControl,
    componentType: this.componentTypeControl,
    government: this.localGovernmentControl,
    decisionMaker: new FormControl<string | undefined>(undefined),
    region: new FormControl<string[]>([]),
    dateDecidedFrom: new FormControl(),
    dateDecidedTo: new FormControl(),
  });
  localGovernments: LocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<LocalGovernmentDto[]>;
  regions: ApplicationRegionDto[] = [];
  statuses: ApplicationStatusDto[] = [];
  previousFileTypes: string[] = [];

  formEmpty = true;
  civicAddressInvalid = false;
  pidInvalid = false;
  searchResultsHidden = true;
  decisionMakers: DecisionMakerDto[] = [];
  STATUS_MAP = Object.entries(STATUS_MAP);
  DECISION_MAP = Object.entries(DECISION_MAP);
  isMobile = false;
  isLoading = false;
  today = new Date();

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (this.isMobile !== isMobile) {
      if (isMobile) {
        this.itemsPerPage = 5;
        this.pageIndex = 0;
      } else {
        this.itemsPerPage = 20;
        this.pageIndex = 0;
      }
      if (!this.searchResultsHidden) {
        this.onSubmit();
      }
    }

    this.isMobile = isMobile;
  }

  constructor(
    private searchService: SearchService,
    private codeService: CodeService,
    private statusService: StatusService,
    private toastService: ToastService,
    private titleService: Title
  ) {
    this.titleService.setTitle('ALC Portal | Public Search');
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (this.isMobile) {
      this.itemsPerPage = 5;
    }

    this.setup();

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
    this.loadCodes();
    this.loadStatuses();

    this.filteredLocalGovernments = this.localGovernmentControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterLocalGovernment(value || ''))
    );

    const storedSearch = sessionStorage.getItem(SEARCH_SESSION_STORAGE_KEY);
    if (storedSearch) {
      const searchRequest: SearchRequestDto = JSON.parse(storedSearch);
      this.populateForm(searchRequest);
      this.onSubmit();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSubmit() {
    const searchParams = this.getSearchParams();

    const searchDto = JSON.stringify(searchParams);
    sessionStorage.setItem(SEARCH_SESSION_STORAGE_KEY, searchDto);

    this.isLoading = true;
    const result = await this.searchService.search(searchParams);
    this.searchResultsHidden = false;
    this.isLoading = false;

    // push tab activation to next render cycle, after the tabGroup is rendered
    setTimeout(() => {
      this.mapSearchResults(result);

      this.setActiveTab();
    });
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

  onClear() {
    this.searchForm.reset();
    sessionStorage.removeItem(SEARCH_SESSION_STORAGE_KEY);
    this.isLoading = false;
    this.searchResultsHidden = true;

    if (this.fileTypeFilterDropDownComponent) {
      this.fileTypeFilterDropDownComponent.reset();
    }
  }

  getSearchParams(): SearchRequestDto {
    const searchControls = this.searchForm.controls;

    return {
      // pagination
      pageSize: this.itemsPerPage,
      page: this.pageIndex + 1,
      // sorting
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      // search parameters
      fileNumber: this.formatStringSearchParam(searchControls.fileNumber.value),
      name: this.formatStringSearchParam(searchControls.name.value),
      civicAddress: this.formatStringSearchParam(searchControls.civicAddress.value),
      decisionOutcome: searchControls.portalDecisionOutcome.value ?? undefined,
      pid: this.formatStringSearchParam(searchControls.pid.value),
      portalStatusCodes: searchControls.portalStatus.value ?? undefined,
      governmentName: this.formatStringSearchParam(searchControls.government.value),
      regionCodes: searchControls.region.value ?? undefined,
      decisionMakerCode: searchControls.decisionMaker.value ?? undefined,
      dateDecidedFrom: searchControls.dateDecidedFrom.value
        ? new Date(searchControls.dateDecidedFrom.value).getTime()
        : undefined,
      dateDecidedTo: searchControls.dateDecidedTo.value
        ? new Date(searchControls.dateDecidedTo.value).getTime()
        : undefined,
      fileTypes: searchControls.componentType.value ? searchControls.componentType.value : [],
    };
  }

  async onApplicationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.searchApplications(searchParams);

    this.applications = result?.data ?? [];
    this.applicationTotal = result?.total ?? 0;
  }

  async onNoticeOfIntentSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.searchNoticeOfIntents(searchParams);

    this.noticeOfIntents = result?.data ?? [];
    this.noticeOfIntentTotal = result?.total ?? 0;
  }

  async onNotificationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.searchNotifications(searchParams);

    this.notifications = result?.data ?? [];
    this.notificationTotal = result?.total ?? 0;
  }

  async onLoadMore(table: string) {
    this.pageIndex += 1;
    const searchParams = this.getSearchParams();

    let result;
    switch (table) {
      case 'APP':
        result = await this.searchService.searchApplications(searchParams);
        if (result) {
          this.applications = [...this.applications, ...result?.data];
          this.applicationTotal = result?.total ?? 0;
        }
        break;
      case 'NOI':
        result = await this.searchService.searchNoticeOfIntents(searchParams);
        if (result) {
          this.noticeOfIntents = [...this.noticeOfIntents, ...result?.data];
          this.noticeOfIntentTotal = result?.total ?? 0;
        }
        break;
      case 'NOTI':
        result = await this.searchService.searchNotifications(searchParams);
        if (result) {
          this.notifications = [...this.notifications, ...result?.data];
          this.notificationTotal = result?.total ?? 0;
        }
        break;
      default:
        this.toastService.showErrorToast('Not implemented');
    }
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

  private async loadCodes() {
    const { localGovernments, regions, decisionMakers } = await this.codeService.loadCodes();
    this.localGovernments = localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.regions = regions.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.decisionMakers = decisionMakers.sort((a, b) => (a.label > b.label ? 1 : -1));
  }

  private filterLocalGovernment(value: string): LocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  private mapSearchResults(searchResult?: SearchResponseDto) {
    if (!searchResult) {
      searchResult = {
        applications: [],
        noticeOfIntents: [],
        notifications: [],
        totalApplications: 0,
        totalNoticeOfIntents: 0,
        totalNotifications: 0,
        outcome: ''
      };
    }

    this.applicationTotal = searchResult.totalApplications;
    this.applications = searchResult.applications;

    this.noticeOfIntentTotal = searchResult.totalNoticeOfIntents;
    this.noticeOfIntents = searchResult.noticeOfIntents;

    this.notifications = searchResult.notifications;
    this.notificationTotal = searchResult.totalNotifications;
    this.outcome = searchResult.outcome || '-';
  }

  private setActiveTab() {
    //Keep this in Tab Order
    const searchCounts = [this.applicationTotal, this.noticeOfIntentTotal, this.notificationTotal];

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
    const statuses = await this.statusService.getStatuses();

    if (statuses) {
      this.populateAllStatuses(statuses);
    }
  }

  private populateAllStatuses(statuses: ApplicationStatusDto[]) {
    this.statuses = statuses;
    this.statuses.sort((a, b) => (a.label > b.label ? 1 : -1));
  }

  private populateForm(storedSearch: SearchRequestDto) {
    const {
      componentType,
      decisionMaker,
      dateDecidedFrom,
      pid,
      fileNumber,
      name,
      dateDecidedTo,
      region,
      civicAddress,
      government,
      portalStatus,
      portalDecisionOutcome
    } = this.searchForm.controls;

    decisionMaker.setValue(storedSearch.decisionMakerCode);
    pid.setValue(storedSearch.pid);
    fileNumber.setValue(storedSearch.fileNumber);
    name.setValue(storedSearch.name);
    region.setValue(storedSearch.regionCodes ?? null);
    civicAddress.setValue(storedSearch.civicAddress);
    government.setValue(storedSearch.governmentName);
    portalStatus.setValue(storedSearch.portalStatusCodes ?? null);
    portalDecisionOutcome.setValue(storedSearch.decisionOutcome ?? null)

    if (storedSearch.dateDecidedTo) {
      dateDecidedTo.setValue(new Date(storedSearch.dateDecidedTo));
    }
    if (storedSearch.dateDecidedFrom) {
      dateDecidedFrom.setValue(new Date(storedSearch.dateDecidedFrom));
    }
    this.previousFileTypes = storedSearch.fileTypes;
    this.componentTypeControl.setValue(storedSearch.fileTypes);
    this.formEmpty = false;
  }
}
