import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { Application } from '../application/application.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { Inquiry } from '../inquiry/inquiry.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { InquiryAdvancedSearchService } from './inquiry/inquiry-advanced-search.service';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NotificationAdvancedSearchService } from './notification/notification-advanced-search.service';
import { PlanningReviewAdvancedSearchService } from './planning-review/planning-review-advanced-search.service';
import { SearchController } from './search.controller';
import { SearchRequestDto } from './search.dto';
import { SearchService } from './search.service';
import { SearchStatusService } from './status/search-status.service';

describe('SearchController', () => {
  let controller: SearchController;
  let mockSearchService: DeepMocked<SearchService>;
  let mockNoticeOfIntentAdvancedSearchService: DeepMocked<NoticeOfIntentAdvancedSearchService>;
  let mockApplicationAdvancedSearchService: DeepMocked<ApplicationAdvancedSearchService>;
  let mockNotificationAdvancedSearchService: DeepMocked<NotificationAdvancedSearchService>;
  let mockPlanningReviewAdvancedSearchService: DeepMocked<PlanningReviewAdvancedSearchService>;
  let mockInquiryAdvancedSearchService: DeepMocked<InquiryAdvancedSearchService>;
  let mockSearchStatusService: DeepMocked<SearchStatusService>;
  let mockDataSource: DeepMocked<DataSource>;
  let mockQueryRunner: DeepMocked<QueryRunner>;
  let mockAppTypeRepo: DeepMocked<Repository<ApplicationType>>;

  const statusSearchMockedResult = [
    {
      fileNumber: 'file1',
      status: 'status',
    },
    {
      fileNumber: 'file2',
      status: 'status',
    },
  ];

  beforeEach(async () => {
    mockSearchService = createMock();
    mockNoticeOfIntentAdvancedSearchService = createMock();
    mockApplicationAdvancedSearchService = createMock();
    mockNotificationAdvancedSearchService = createMock();
    mockPlanningReviewAdvancedSearchService = createMock();
    mockInquiryAdvancedSearchService = createMock();
    mockSearchStatusService = createMock();
    mockDataSource = createMock();
    mockAppTypeRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: NoticeOfIntentAdvancedSearchService,
          useValue: mockNoticeOfIntentAdvancedSearchService,
        },
        {
          provide: ApplicationAdvancedSearchService,
          useValue: mockApplicationAdvancedSearchService,
        },
        {
          provide: NotificationAdvancedSearchService,
          useValue: mockNotificationAdvancedSearchService,
        },
        {
          provide: PlanningReviewAdvancedSearchService,
          useValue: mockPlanningReviewAdvancedSearchService,
        },
        {
          provide: InquiryAdvancedSearchService,
          useValue: mockInquiryAdvancedSearchService,
        },
        {
          provide: SearchStatusService,
          useValue: mockSearchStatusService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: mockAppTypeRepo,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [SearchController],
    }).compile();

    controller = module.get<SearchController>(SearchController);

    mockQueryRunner = createMock<QueryRunner>();
    mockQueryRunner.release.mockResolvedValue();
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);

    mockSearchService.getApplication.mockResolvedValue(new Application());
    mockSearchService.getNoi.mockResolvedValue(new NoticeOfIntent());
    mockSearchService.getNotification.mockResolvedValue(new Notification());
    mockSearchService.getPlanningReview.mockResolvedValue(new PlanningReview());
    mockSearchService.getInquiry.mockResolvedValue(new Inquiry());

    mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockApplicationAdvancedSearchService.searchApplications.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockNotificationAdvancedSearchService.search.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockPlanningReviewAdvancedSearchService.search.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockInquiryAdvancedSearchService.search.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockSearchStatusService.searchApplicationStatus.mockResolvedValue(statusSearchMockedResult);
    mockSearchStatusService.searchNoiStatus.mockResolvedValue(statusSearchMockedResult);
    mockSearchStatusService.searchNotificationStatus.mockResolvedValue(statusSearchMockedResult);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to retrieve Application, Noi, Planning, Covenant, Notification, by file number', async () => {
    const searchString = 'fake';
    const result = await controller.search(searchString);

    expect(mockSearchService.getApplication).toHaveBeenCalledTimes(1);
    expect(mockSearchService.getApplication).toHaveBeenCalledWith(searchString);
    expect(mockSearchService.getNoi).toHaveBeenCalledTimes(1);
    expect(mockSearchService.getNoi).toHaveBeenCalledWith(searchString);
    expect(mockSearchService.getPlanningReview).toHaveBeenCalledTimes(1);
    expect(mockSearchService.getPlanningReview).toHaveBeenCalledWith(searchString);
    expect(mockSearchService.getNotification).toHaveBeenCalledTimes(1);
    expect(mockSearchService.getNotification).toHaveBeenCalledWith(searchString);
    expect(result).toBeDefined();
    expect(result.length).toBe(5);
  });

  it('should call advanced search to retrieve Applications, NOIs, PlanningReviews, Covenants, Notifications, Inquiries', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      name: 'test',
      fileTypes: [],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearch(mockSearchRequestDto);

    expect(mockApplicationAdvancedSearchService.searchApplications).toHaveBeenCalledTimes(1);
    expect(mockApplicationAdvancedSearchService.searchApplications).toHaveBeenCalledWith(mockSearchRequestDto, {});
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents).toHaveBeenCalledTimes(1);
    expect(mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents).toHaveBeenCalledWith(
      mockSearchRequestDto,
      {},
    );
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);

    expect(mockInquiryAdvancedSearchService.search).toHaveBeenCalledTimes(1);
    expect(mockInquiryAdvancedSearchService.search).toHaveBeenCalledWith(mockSearchRequestDto, {});
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should call applications advanced search to retrieve Applications', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: [],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearchApplications(mockSearchRequestDto);

    expect(mockDataSource.createQueryRunner).toHaveBeenCalledTimes(1);
    expect(mockApplicationAdvancedSearchService.searchApplications).toHaveBeenCalledTimes(1);
    expect(mockApplicationAdvancedSearchService.searchApplications).toHaveBeenCalledWith(mockSearchRequestDto, {});
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('should call NOI advanced search to retrieve NOIs', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: [],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearchNoticeOfIntents(mockSearchRequestDto);

    expect(mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents).toHaveBeenCalledTimes(1);
    expect(mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents).toHaveBeenCalledWith(
      mockSearchRequestDto,
      {},
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call advanced search to retrieve Applications only when application file type selected', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NFUP'],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearch(mockSearchRequestDto);

    expect(mockDataSource.createQueryRunner).toHaveBeenCalledTimes(1);
    expect(mockApplicationAdvancedSearchService.searchApplications).toHaveBeenCalledTimes(1);
    expect(mockApplicationAdvancedSearchService.searchApplications).toHaveBeenCalledWith(mockSearchRequestDto, {});
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('should call advanced search to retrieve NOIs only when NOI file type selected', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NOI'],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearch(mockSearchRequestDto);

    expect(mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents).toHaveBeenCalledTimes(1);
    expect(mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents).toHaveBeenCalledWith(
      mockSearchRequestDto,
      {},
    );
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should call advanced search to retrieve Inquiries only when Inquiry file type selected', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['GENC'],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearch(mockSearchRequestDto);

    expect(mockInquiryAdvancedSearchService.search).toHaveBeenCalledTimes(1);
    expect(mockInquiryAdvancedSearchService.search).toHaveBeenCalledWith(mockSearchRequestDto, {});
    expect(result.inquiries).toBeDefined();
    expect(result.totalInquiries).toBe(0);
  });

  it('should call advanced search to retrieve Planning Review only when Planning Review file type selected', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['MISC'],
      portalStatusCodes: [],
    };

    const result = await controller.advancedSearch(mockSearchRequestDto);

    expect(mockPlanningReviewAdvancedSearchService.search).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewAdvancedSearchService.search).toHaveBeenCalledWith(mockSearchRequestDto, {});
    expect(result.inquiries).toBeDefined();
    expect(result.totalInquiries).toBe(0);
  });

  it('should call application status search', async () => {
    const fileNumbers = ['file1', 'file2'];

    const result = await controller.advancedSearchApplicationStatus(fileNumbers);

    expect(mockSearchStatusService.searchApplicationStatus).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should call noi status search', async () => {
    const fileNumbers = ['file1', 'file2'];

    const result = await controller.advancedSearchNoiStatus(fileNumbers);

    expect(mockSearchStatusService.searchNoiStatus).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should call notification status search', async () => {
    const fileNumbers = ['file1', 'file2'];

    const result = await controller.advancedSearchNotificationStatus(fileNumbers);

    expect(mockSearchStatusService.searchNotificationStatus).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });
});
