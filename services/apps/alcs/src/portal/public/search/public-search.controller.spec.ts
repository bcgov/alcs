import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { Application } from '../../../alcs/application/application.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { Notification } from '../../../alcs/notification/notification.entity';
import { PublicApplicationSearchService } from './application/public-application-search.service';
import { PublicNoticeOfIntentSearchService } from './notice-of-intent/public-notice-of-intent-search.service';
import { PublicNotificationSearchService } from './notification/public-notification-search.service';
import { PublicSearchController } from './public-search.controller';
import { SearchRequestDto } from './public-search.dto';
import { PublicSearchService } from './public-search.service';

describe('PublicSearchController', () => {
  let controller: PublicSearchController;
  let mockSearchService: DeepMocked<PublicSearchService>;
  let mockNoticeOfIntentAdvancedSearchService: DeepMocked<PublicNoticeOfIntentSearchService>;
  let mockApplicationAdvancedSearchService: DeepMocked<PublicApplicationSearchService>;
  let mockNotificationAdvancedSearchService: DeepMocked<PublicNotificationSearchService>;

  beforeEach(async () => {
    mockSearchService = createMock();
    mockNoticeOfIntentAdvancedSearchService = createMock();
    mockApplicationAdvancedSearchService = createMock();
    mockNotificationAdvancedSearchService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: PublicSearchService,
          useValue: mockSearchService,
        },
        {
          provide: PublicNoticeOfIntentSearchService,
          useValue: mockNoticeOfIntentAdvancedSearchService,
        },
        {
          provide: PublicApplicationSearchService,
          useValue: mockApplicationAdvancedSearchService,
        },
        {
          provide: PublicNotificationSearchService,
          useValue: mockNotificationAdvancedSearchService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [PublicSearchController],
    }).compile();

    controller = module.get<PublicSearchController>(PublicSearchController);

    mockSearchService.getApplication.mockResolvedValue(new Application());
    mockSearchService.getNoi.mockResolvedValue(new NoticeOfIntent());
    mockSearchService.getNotification.mockResolvedValue(new Notification());

    mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents.mockResolvedValue(
      {
        data: [],
        total: 0,
      },
    );

    mockApplicationAdvancedSearchService.searchApplications.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockNotificationAdvancedSearchService.search.mockResolvedValue({
      data: [],
      total: 0,
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call search to retrieve Applications, NOIs, PlanningReviews, Covenants, Notifications', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      name: 'test',
      fileTypes: [],
    };

    const result = await controller.search(
      mockSearchRequestDto as SearchRequestDto,
    );

    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should call applications advanced search to retrieve Applications', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      fileTypes: [],
    };

    const result = await controller.advancedSearchApplications(
      mockSearchRequestDto as SearchRequestDto,
    );

    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call NOI advanced search to retrieve NOIs', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: [],
    };

    const result = await controller.advancedSearchNoticeOfIntents(
      mockSearchRequestDto as SearchRequestDto,
    );

    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call search to retrieve Applications only when application file type selected', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NFUP'],
    };

    const result = await controller.search(
      mockSearchRequestDto as SearchRequestDto,
    );

    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);
  });

  it('should call search to retrieve NOIs only when NOI file type selected', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NOI'],
    };

    const result = await controller.search(
      mockSearchRequestDto as SearchRequestDto,
    );

    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should NOT call NOI search to retrieve if file type app specified', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NFUP'],
    };

    const result = await controller.search(mockSearchRequestDto);

    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationAdvancedSearchService.searchApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(
      mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents,
    ).toBeCalledTimes(0);
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });
});
