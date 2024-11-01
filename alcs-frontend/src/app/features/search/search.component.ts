import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { Observable, Subject, combineLatestWith, map, startWith, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationStatusDto } from '../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationService } from '../../services/application/application.service';
import { NoticeOfIntentStatusDto } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NotificationSubmissionStatusService } from '../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationSubmissionStatusDto } from '../../services/notification/notification.dto';
import { FileTypeDataSourceService } from '../../services/search/file-type/file-type-data-source.service';
import { PortalStatusDataSourceService } from '../../services/search/portal-status/portal-status-data-source.service';
import {
  AdvancedSearchResponseDto,
  ApplicationSearchResultDto,
  InquirySearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  PlanningReviewSearchResultDto,
  SearchRequestDto,
} from '../../services/search/search.dto';
import { SearchService } from '../../services/search/search.service';
import { ToastService } from '../../services/toast/toast.service';
import { formatDateForApi } from '../../shared/utils/api-date-formatter';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down/file-type-filter-drop-down.component';
import { TableChange } from './search.interface';
import { AuthenticationService, ROLES } from '../../services/authentication/authentication.service';
import { TagCategoryService } from '../../services/tag/tag-category/tag-category.service';
import { TagCategoryDto } from '../../services/tag/tag-category/tag-category.dto';
import { TagDto } from '../../services/tag/tag.dto';
import { TagService } from '../../services/tag/tag.service';

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
  @ViewChild('statusTypeDropDown') portalStatusFilterDropDownComponent!: FileTypeFilterDropDownComponent;

  applications: ApplicationSearchResultDto[] = [];
  applicationTotal = 0;

  noticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
  noticeOfIntentTotal = 0;

  planningReviews: PlanningReviewSearchResultDto[] = [];
  planningReviewsTotal = 0;

  notifications: NotificationSearchResultDto[] = [];
  notificationTotal = 0;

  inquiries: InquirySearchResultDto[] = [];
  inquiriesTotal = 0;

  pageIndex = 0;
  itemsPerPage = 20;
  sortDirection: SortDirection = 'desc';
  sortField = 'dateSubmitted';

  localGovernmentControl = new FormControl<string | undefined>(undefined);
  portalStatusControl = new FormControl<string[]>([]);
  componentTypeControl = new FormControl<string[] | undefined>(undefined);
  pidControl = new FormControl<string | undefined>(undefined);
  nameControl = new FormControl<string | undefined>(undefined);
  civicAddressControl = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl<string | undefined>(undefined),
    name: this.nameControl,
    pid: this.pidControl,
    civicAddress: this.civicAddressControl,
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
    tagCategory: new FormControl<string | undefined>(undefined),
    tag: new FormControl<string[]>([]),
  });
  resolutionYears: number[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<ApplicationLocalGovernmentDto[]>;
  regions: ApplicationRegionDto[] = [];
  tags: TagDto[] = [];
  tagCategories: TagCategoryDto[] = [];
  applicationStatuses: ApplicationStatusDto[] = [];
  allStatuses: (ApplicationStatusDto | NoticeOfIntentStatusDto | NotificationSubmissionStatusDto)[] = [];

  formEmpty = true;
  civicAddressInvalid = false;
  pidInvalid = false;
  searchResultsHidden = true;
  notificationStatuses: NotificationSubmissionStatusDto[] = [];
  noiStatuses: NoticeOfIntentStatusDto[] = [];
  isLoading = false;
  today = new Date();
  isCommissioner = false;

  constructor(
    private searchService: SearchService,
    private activatedRoute: ActivatedRoute,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private notificationStatusService: NotificationSubmissionStatusService,
    private noiStatusService: NoticeOfIntentSubmissionStatusService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private titleService: Title,
    private authService: AuthenticationService,
    public fileTypeService: FileTypeDataSourceService,
    public portalStatusDataService: PortalStatusDataSourceService,
    public tagCategoryService: TagCategoryService,
    public tagService: TagService,
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
          this.onSubmit();
        }
      });

    this.tagCategoryService.$categories
      .pipe(takeUntil(this.$destroy))
      .subscribe((result: { data: TagCategoryDto[]; total: number }) => {
      this.tagCategories = result.data;
    });

    this.tagService.$tags
      .pipe(takeUntil(this.$destroy))
      .subscribe((result: { data: TagDto[]; total: number }) => {
      this.tags = result.data;
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

    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.isCommissioner =
          currentUser.client_roles && currentUser.client_roles.length === 1
            ? currentUser.client_roles.includes(ROLES.COMMISSIONER)
            : false;
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
    this.loadStatuses();

    this.tagCategoryService.fetch(0, 0);
    this.tagService.fetch(0, 0);

    this.filteredLocalGovernments = this.localGovernmentControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterLocalGovernment(value || '')),
    );
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSubmit() {
    this.pageIndex = 0;
    const searchParams = this.getSearchParams();
    this.searchResultsHidden = false;
    this.isLoading = true;
    const result = await this.searchService.advancedSearchFetch(searchParams);

    this.isLoading = false;
    if (result !== undefined) {
      this.toastService.showSuccessToast('Results updated');
    }

    // push tab activation to next render cycle, after the tabGroup is rendered
    setTimeout(() => {
      this.mapSearchResults(result);
      this.setActiveTab();
      this.scrollToResults();
    });
  }

  scrollToResults() {
    setTimeout(() => {
      const element = document.getElementById('results');

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'center',
        });
      }
    });
  }

  onReset() {
    this.searchForm.reset({
      portalStatus: [],
    });

    if (this.fileTypeFilterDropDownComponent) {
      this.fileTypeFilterDropDownComponent.reset();
    }

    if (this.portalStatusFilterDropDownComponent) {
      this.portalStatusFilterDropDownComponent.reset();
    }
  }

  getSearchParams(): SearchRequestDto {
    const resolutionNumberString = this.formatStringSearchParam(this.searchForm.controls.resolutionNumber.value);
    let fileTypes: string[];
    let portalStatusCodes;

    if (this.searchForm.controls.componentType.value === null) {
      fileTypes = this.isCommissioner ? this.fileTypeService.getCommissionerListData() : [];
    } else {
      fileTypes = this.searchForm.controls.componentType.value!;
    }

    if (this.searchForm.controls.portalStatus.value?.length === 0) {
      portalStatusCodes = this.isCommissioner ? this.portalStatusDataService.getCommissionerListData() : [];
    } else {
      portalStatusCodes = this.searchForm.controls.portalStatus.value!;
    }

    return {
      // pagination
      pageSize: this.itemsPerPage,
      page: this.pageIndex + 1,
      // sorting
      sortField: this.sortField,
      sortDirection: this.sortDirection.toUpperCase(),
      // search parameters
      fileNumber: this.formatStringSearchParam(this.searchForm.controls.fileNumber.value),
      legacyId: this.formatStringSearchParam(this.searchForm.controls.legacyId.value),
      name: this.formatStringSearchParam(this.searchForm.controls.name.value),
      civicAddress: this.formatStringSearchParam(this.searchForm.controls.civicAddress.value),
      pid: this.formatStringSearchParam(this.searchForm.controls.pid.value),
      resolutionNumber: resolutionNumberString ? parseInt(resolutionNumberString) : undefined,
      resolutionYear: this.searchForm.controls.resolutionYear.value ?? undefined,
      portalStatusCodes: portalStatusCodes,
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
      fileTypes: fileTypes,
      tagCategoryId: this.searchForm.controls.tagCategory.value ?? undefined,
      tagIds: this.searchForm.controls.tag.value ?? undefined,
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

  async onPlanningReviewSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchPlanningReviewsFetch(searchParams);

    this.planningReviews = result?.data ?? [];
    this.planningReviewsTotal = result?.total ?? 0;
  }

  async onNotificationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchNotificationsFetch(searchParams);

    this.notifications = result?.data ?? [];
    this.notificationTotal = result?.total ?? 0;
  }

  async onInquirySearch() {
    const searchParams = this.getSearchParams();
    const result = await this.searchService.advancedSearchInquiryFetch(searchParams);

    this.inquiries = result?.data ?? [];
    this.inquiriesTotal = result?.total ?? 0;
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
        await this.onPlanningReviewSearch();
        break;
      case 'NOTI':
        await this.onNotificationSearch();
        break;
      case 'INQR':
        await this.onInquirySearch();
        break;
      default:
        this.toastService.showErrorToast('Not implemented');
    }
  }

  onFileTypeChange(fileTypes: string[]) {
    this.componentTypeControl.setValue(fileTypes);
  }

  onPortalStatusChange(statusCodes: string[]) {
    this.portalStatusControl.setValue(statusCodes);
  }

  private async loadGovernments() {
    const governments = await this.localGovernmentService.list();
    this.localGovernments = governments.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  private filterLocalGovernment(value: string): ApplicationLocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue),
      );
    }
    return [];
  }

  private mapSearchResults(searchResult?: AdvancedSearchResponseDto) {
    if (!searchResult) {
      searchResult = {
        applications: [],
        noticeOfIntents: [],
        planningReviews: [],
        notifications: [],
        inquiries: [],
        totalApplications: 0,
        totalNoticeOfIntents: 0,
        totalNotifications: 0,
        totalPlanningReviews: 0,
        totalInquiries: 0,
      };
    }

    this.applicationTotal = searchResult.totalApplications;
    this.applications = searchResult.applications;

    this.noticeOfIntentTotal = searchResult.totalNoticeOfIntents;
    this.noticeOfIntents = searchResult.noticeOfIntents;

    this.planningReviewsTotal = searchResult.totalPlanningReviews;
    this.planningReviews = searchResult.planningReviews;

    this.notifications = searchResult.notifications;
    this.notificationTotal = searchResult.totalNotifications;

    this.inquiries = searchResult.inquiries;
    this.inquiriesTotal = searchResult.totalInquiries;
  }

  private setActiveTab() {
    //Keep this in Tab Order
    const searchCounts = [
      this.applicationTotal,
      this.noticeOfIntentTotal,
      this.planningReviewsTotal,
      this.notificationTotal,
      this.inquiriesTotal,
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
