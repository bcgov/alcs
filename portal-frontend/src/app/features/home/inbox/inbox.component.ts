import { Component, HostListener, OnDestroy, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import {
  ApplicationStatusDto,
  SUBMISSION_STATUS,
} from '../../../services/application-submission/application-submission.dto';
import { UserDto } from '../../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { BaseInboxResultDto, InboxRequestDto, InboxSearchResponseDto } from '../../../services/inbox/inbox.dto';
import { InboxService } from '../../../services/inbox/inbox.service';
import { ToastService } from '../../../services/toast/toast.service';
import { MOBILE_BREAKPOINT } from '../../../shared/utils/breakpoints';
import { FileTypeFilterDropDownComponent } from '../../public/search/file-type-filter-drop-down/file-type-filter-drop-down.component';
import { TableChange } from '../../public/search/search.interface';
import { Router } from '@angular/router';

export interface InboxResultDto extends BaseInboxResultDto {
  statusType: ApplicationStatusDto;
  routerLink?: string;
}

const CLASS_TO_URL_MAP: Record<string, string> = {
  APP: 'application',
  NOI: 'notice-of-intent',
  NOTI: 'notification',
};

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  tabGroup!: MatTabGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatTabGroup)
  set tab(tabGroup: MatTabGroup) {
    if (tabGroup) {
      // Override click handler to change URL
      tabGroup._handleClick = (_tab, _tabHeader, index) => {
        this.router.navigateByUrl(`/home/${_tab.textLabel}`);
      };
    }
    this.tabGroup = tabGroup;
  }
  @ViewChild('fileTypeDropDown') fileTypeFilterDropDownComponent!: FileTypeFilterDropDownComponent;

  @Input() currentTabName: string = '';

  applications: InboxResultDto[] = [];
  applicationTotal = 0;

  noticeOfIntents: InboxResultDto[] = [];
  noticeOfIntentTotal = 0;

  notifications: InboxResultDto[] = [];
  notificationTotal = 0;

  pageIndex = 0;
  itemsPerPage = 10;

  governmentFileNumber = new FormControl<string | undefined>(undefined);
  portalStatusControl = new FormControl<string[]>([]);
  componentTypeControl = new FormControl<string[] | undefined>(undefined);
  pidControl = new FormControl<string | undefined>(undefined);
  nameControl = new FormControl<string | undefined>(undefined);
  civicAddressControl = new FormControl<string | undefined>(undefined);
  filterBy = new FormControl<string | undefined>(undefined);
  searchForm = new FormGroup({
    fileNumber: new FormControl<string | undefined>(undefined),
    name: this.nameControl,
    pid: this.pidControl,
    civicAddress: this.civicAddressControl,
    portalStatus: this.portalStatusControl,
    componentType: this.componentTypeControl,
    governmentFileNumber: this.governmentFileNumber,
    filterBy: this.filterBy,
  });
  previousFileTypes: string[] = [];

  civicAddressInvalid = false;
  pidInvalid = false;
  isMobile = false;
  isLoading = false;

  applicationStatuses: ApplicationStatusDto[] = [];
  noticeOfIntentStatuses: ApplicationStatusDto[] = [];
  notificationStatuses: ApplicationStatusDto[] = [];
  allStatuses: ApplicationStatusDto[] = [];
  profile: UserDto | undefined;

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
      this.onSubmit();
    }

    this.isMobile = isMobile;
  }

  constructor(
    private inboxService: InboxService,
    private toastService: ToastService,
    private titleService: Title,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.titleService.setTitle('ALC Portal | Inbox');
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (this.isMobile) {
      this.itemsPerPage = 5;
    }

    this.setup();

    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((profile) => {
      this.profile = profile;
    });

    this.civicAddressControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.civicAddressInvalid =
        this.civicAddressControl.invalid && (this.civicAddressControl.dirty || this.civicAddressControl.touched);
    });

    this.pidControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.pidInvalid = this.pidControl.invalid && (this.pidControl.dirty || this.pidControl.touched);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.currentTabName = changes['currentTabName'].currentValue;
    this.tabGroup.selectedIndex = this.tabIndexFromName(this.currentTabName);
  }

  tabIndexFromName(tabName: string) {
    // Default to 'application' tab
    if (!this.tabGroup) return 0;

    return this.tabGroup._tabs
      .map((a) => a.textLabel)
      .reduce((iPrev, b, i) => {
        if (b == tabName) return i;
        return iPrev;
      }, 0);
  }

  private async setup() {
    await this.loadStatuses();
    await this.onSubmit();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSubmit() {
    await this.populateTable();

    // push tab activation to next render cycle, after the tabGroup is rendered
    setTimeout(() => {
      this.tabGroup.selectedIndex = this.tabIndexFromName(this.currentTabName);
    });
  }

  async populateTable() {
    const searchParams = this.getSearchParams();

    this.isLoading = true;
    const result = await this.inboxService.search(searchParams);
    this.isLoading = false;

    // push tab activation to next render cycle, after the tabGroup is rendered
    setTimeout(() => {
      this.mapSearchResults(result);
    });
  }

  onClear() {
    this.searchForm.reset();
    this.onSubmit();

    if (this.fileTypeFilterDropDownComponent) {
      this.fileTypeFilterDropDownComponent.reset();
    }
  }

  getSearchParams(): InboxRequestDto {
    const searchControls = this.searchForm.controls;

    return {
      // pagination
      pageSize: this.itemsPerPage,
      page: this.pageIndex + 1,
      // search parameters
      fileNumber: this.formatStringSearchParam(searchControls.fileNumber.value),
      name: this.formatStringSearchParam(searchControls.name.value),
      civicAddress: this.formatStringSearchParam(searchControls.civicAddress.value),
      pid: this.formatStringSearchParam(searchControls.pid.value),
      portalStatusCodes: searchControls.portalStatus.value ?? undefined,
      governmentFileNumber: this.formatStringSearchParam(searchControls.governmentFileNumber.value),
      fileTypes: searchControls.componentType.value ? searchControls.componentType.value : [],
      filterBy: searchControls.filterBy.value ?? undefined,
    };
  }

  async onApplicationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.inboxService.searchApplications(searchParams);

    this.applications = this.hydrateResult(result?.data ?? []);
    this.applicationTotal = result?.total ?? 0;
  }

  async onNoticeOfIntentSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.inboxService.searchNoticeOfIntents(searchParams);

    this.noticeOfIntents = this.hydrateResult(result?.data ?? []);
    this.noticeOfIntentTotal = result?.total ?? 0;
  }

  async onNotificationSearch() {
    const searchParams = this.getSearchParams();
    const result = await this.inboxService.searchNotifications(searchParams);

    this.notifications = this.hydrateResult(result?.data ?? []);
    this.notificationTotal = result?.total ?? 0;
  }

  hydrateResult(result: BaseInboxResultDto[]): InboxResultDto[] {
    return result.map((result) => {
      const statuses = this.getStatuses(result.class);
      const status = statuses.find((status) => status.code === result.status);
      const url = CLASS_TO_URL_MAP[result.class];

      return {
        ...result,
        routerLink: status?.code !== SUBMISSION_STATUS.CANCELLED ? `/${url}/${result.referenceId}` : undefined,
        statusType: status!,
      };
    });
  }

  getStatuses(myClass: string) {
    switch (myClass) {
      case 'APP':
        return this.applicationStatuses;
      case 'NOI':
        return this.noticeOfIntentStatuses;
      case 'NOTI':
      default:
        return this.notificationStatuses;
    }
  }

  async onLoadMore(table: string) {
    this.pageIndex += 1;
    const searchParams = this.getSearchParams();

    let result;
    switch (table) {
      case 'APP':
        result = await this.inboxService.searchApplications(searchParams);
        if (result) {
          this.applications = this.hydrateResult([...this.applications, ...result?.data]);
          this.applicationTotal = result?.total ?? 0;
        }
        break;
      case 'NOI':
        result = await this.inboxService.searchNoticeOfIntents(searchParams);
        if (result) {
          this.noticeOfIntents = this.hydrateResult([...this.noticeOfIntents, ...result?.data]);
          this.noticeOfIntentTotal = result?.total ?? 0;
        }
        break;
      case 'NOTI':
        result = await this.inboxService.searchNotifications(searchParams);
        if (result) {
          this.notifications = this.hydrateResult([...this.notifications, ...result?.data]);
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

  private mapSearchResults(searchResult?: InboxSearchResponseDto) {
    if (!searchResult) {
      searchResult = {
        applications: [],
        noticeOfIntents: [],
        notifications: [],
        totalApplications: 0,
        totalNoticeOfIntents: 0,
        totalNotifications: 0,
      };
    }

    this.applicationTotal = searchResult.totalApplications;
    this.applications = this.hydrateResult(searchResult.applications);

    this.noticeOfIntentTotal = searchResult.totalNoticeOfIntents;
    this.noticeOfIntents = this.hydrateResult(searchResult.noticeOfIntents);

    this.notificationTotal = searchResult.totalNotifications;
    this.notifications = this.hydrateResult(searchResult.notifications);
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
    const res = await this.inboxService.listStatuses();

    if (res) {
      this.applicationStatuses = res.application;
      this.noticeOfIntentStatuses = res.noticeOfIntent;
      this.notificationStatuses = res.notification;
      this.populateAllStatuses();
    }
  }

  private populateAllStatuses() {
    const statusCodes = new Set<string>();
    const result = [];
    const allStatuses = [...this.applicationStatuses, ...this.noticeOfIntentStatuses, ...this.notificationStatuses];
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
