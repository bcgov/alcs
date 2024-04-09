import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CodeService } from '../../../services/code/code.service';
import { SearchRequestDto } from '../../../services/search/search.dto';
import { SearchService } from '../../../services/search/search.service';
import { StatusService } from '../../../services/status/status.service';
import { ToastService } from '../../../services/toast/toast.service';
import { MOBILE_BREAKPOINT } from '../../../shared/utils/breakpoints';

import { PublicSearchComponent } from './public-search.component';

describe('PublicSearchComponent', () => {
  let component: PublicSearchComponent;
  let fixture: ComponentFixture<PublicSearchComponent>;
  let mockSearchService: DeepMocked<SearchService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockStatusService: DeepMocked<StatusService>;

  beforeEach(async () => {
    mockCodeService = createMock();
    mockSearchService = createMock();
    mockStatusService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [PublicSearchComponent],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: StatusService,
          useValue: mockStatusService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSearchComponent);
    component = fixture.componentInstance;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    mockStatusService.getStatuses.mockResolvedValue([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('No Saved Search', () => {
    beforeEach(async () => {
      fixture.detectChanges();
    });

    it('should set the mobile flag to true when the page resizes to mobile', () => {
      window = Object.assign(window, { innerWidth: MOBILE_BREAKPOINT - 1 });
      component.onWindowResize();
      expect(component.isMobile).toBeTruthy();
    });

    it('should set the mobile flag to false when the page resizes to desktop', () => {
      window = Object.assign(window, { innerWidth: MOBILE_BREAKPOINT + 1 });
      component.onWindowResize();
      expect(component.isMobile).toBeFalsy();
    });

    it('should populate search results on successful search', async () => {
      const mockResponse = {
        applications: [],
        noticeOfIntents: [],
        notifications: [],
        totalApplications: 5,
        totalNoticeOfIntents: 6,
        totalNotifications: 7,
      };
      mockSearchService.search.mockResolvedValue(mockResponse);

      await component.onSubmit();

      expect(component.applicationTotal).toEqual(mockResponse.totalApplications);
      expect(component.noticeOfIntentTotal).toEqual(mockResponse.totalNoticeOfIntents);
      expect(component.notificationTotal).toEqual(mockResponse.totalNotifications);
      expect(component.searchResultsHidden).toBeFalsy();
    });

    it('should search applications when changing table on that page', async () => {
      const mockResponse = {
        applications: [],
        noticeOfIntents: [],
        notifications: [],
        totalApplications: 5,
        totalNoticeOfIntents: 6,
        totalNotifications: 7,
      };
      mockSearchService.searchApplications.mockResolvedValue({
        data: [],
        total: 0,
      });

      await component.onTableChange({
        itemsPerPage: 0,
        pageIndex: 0,
        sortDirection: '',
        sortField: '',
        tableType: 'APP',
      });

      expect(mockSearchService.searchApplications).toHaveBeenCalledTimes(1);
    });

    it('should search applications when loading more on app table', async () => {
      component.applications = [];
      mockSearchService.searchApplications.mockResolvedValue({
        data: [],
        total: 0,
      });

      await component.onLoadMore('APP');

      expect(mockSearchService.searchApplications).toHaveBeenCalledTimes(1);
    });
  });

  describe('Saved Search', () => {
    const mockRequest: SearchRequestDto = {
      fileTypes: [],
      page: 1,
      pageSize: 20,
      sortDirection: '',
      sortField: '',
      decisionMakerCode: 'decisionMakerCode',
      pid: 'pid',
      civicAddress: 'civicAddress',
    };

    beforeEach(async () => {
      window.localStorage.removeItem('search');
      const mockResponse = {
        applications: [],
        noticeOfIntents: [],
        notifications: [],
        totalApplications: 5,
        totalNoticeOfIntents: 6,
        totalNotifications: 7,
      };
      mockSearchService.search.mockResolvedValue(mockResponse);
      sessionStorage.setItem('search', JSON.stringify(mockRequest));

      fixture.detectChanges();
    });

    afterEach(async () => {
      sessionStorage.removeItem('search');
    });

    it('should populate the form with the saved search', () => {
      expect(component.formEmpty).toBeFalsy();
      expect(component.searchForm.controls.pid.value).toEqual(mockRequest.pid);
      expect(component.searchForm.controls.decisionMaker.value).toEqual(mockRequest.decisionMakerCode);
      expect(component.searchForm.controls.civicAddress.value).toEqual(mockRequest.civicAddress);
    });
  });
});
