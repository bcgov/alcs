import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { Application } from '../application/application.entity';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { NonApplicationSearchView } from './non-applications/non-applications-view.entity';
import { NonApplicationsAdvancedSearchService } from './non-applications/non-applications.service';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { SearchController } from './search.controller';
import {
  AdvancedSearchResultDto,
  NonApplicationsSearchRequestDto,
  SearchRequestDto,
} from './search.dto';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let mockSearchService: DeepMocked<SearchService>;
  let mockNoticeOfIntentAdvancedSearchService: DeepMocked<NoticeOfIntentAdvancedSearchService>;
  let mockApplicationAdvancedSearchService: DeepMocked<ApplicationAdvancedSearchService>;
  let mockNonApplicationsAdvancedSearchService: DeepMocked<NonApplicationsAdvancedSearchService>;

  beforeEach(async () => {
    mockSearchService = createMock();
    mockNoticeOfIntentAdvancedSearchService = createMock();
    mockApplicationAdvancedSearchService = createMock();
    mockNonApplicationsAdvancedSearchService = createMock();

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
          provide: NonApplicationsAdvancedSearchService,
          useValue: mockNonApplicationsAdvancedSearchService,
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

    mockSearchService.getApplication.mockResolvedValue(new Application());
    mockSearchService.getNoi.mockResolvedValue(new NoticeOfIntent());
    mockSearchService.getNotification.mockResolvedValue(new Notification());
    mockSearchService.getPlanningReview.mockResolvedValue(
      new PlanningReview({
        card: {
          board: {
            code: 'fake_board',
          } as Board,
        } as Card,
      }),
    );
    mockSearchService.getCovenant.mockResolvedValue(
      new Covenant({
        card: {
          board: {
            code: 'fake_board',
          } as Board,
        } as Card,
      }),
    );

    const mockNoiResult = new AdvancedSearchResultDto<
      NoticeOfIntentSubmissionSearchView[]
    >();
    mockNoiResult.data = new Array<NoticeOfIntentSubmissionSearchView>();
    mockNoiResult.total = 0;
    mockNoticeOfIntentAdvancedSearchService.searchNoticeOfIntents.mockResolvedValue(
      mockNoiResult,
    );

    const mockApplicationResult = new AdvancedSearchResultDto<
      ApplicationSubmissionSearchView[]
    >();
    mockApplicationResult.data = new Array<ApplicationSubmissionSearchView>();
    mockApplicationResult.total = 0;
    mockApplicationAdvancedSearchService.searchApplications.mockResolvedValue(
      mockApplicationResult,
    );

    const mockNonApplicationResult = new AdvancedSearchResultDto<
      NonApplicationSearchView[]
    >();
    mockNonApplicationResult.data = new Array<NonApplicationSearchView>();
    mockNonApplicationResult.total = 0;
    mockNonApplicationsAdvancedSearchService.searchNonApplications.mockResolvedValue(
      mockNonApplicationResult,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to retrieve Application, Noi, Planning, Covenant, Notification, by file number', async () => {
    const searchString = 'fake';
    const result = await controller.search(searchString);

    expect(mockSearchService.getApplication).toBeCalledTimes(1);
    expect(mockSearchService.getApplication).toBeCalledWith(searchString);
    expect(mockSearchService.getNoi).toBeCalledTimes(1);
    expect(mockSearchService.getNoi).toBeCalledWith(searchString);
    expect(mockSearchService.getPlanningReview).toBeCalledTimes(1);
    expect(mockSearchService.getPlanningReview).toBeCalledWith(searchString);
    expect(mockSearchService.getCovenant).toBeCalledTimes(1);
    expect(mockSearchService.getCovenant).toBeCalledWith(searchString);
    expect(mockSearchService.getNotification).toHaveBeenCalledTimes(1);
    expect(mockSearchService.getNotification).toBeCalledWith(searchString);
    expect(result).toBeDefined();
    expect(result.length).toBe(5);
  });

  it('should call advanced search to retrieve Applications, NOIs, PlanningReviews, Covenants', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      applicationFileTypes: [],
    };

    const result = await controller.advancedSearch(
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

    expect(
      mockNonApplicationsAdvancedSearchService.searchNonApplications,
    ).toBeCalledTimes(1);
    expect(
      mockNonApplicationsAdvancedSearchService.searchNonApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.nonApplications).toBeDefined();
    expect(result.totalNonApplications).toBe(0);
  });

  it('should call applications advanced search to retrieve Applications', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      applicationFileTypes: [],
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
      isIncludeOtherParcels: false,
      applicationFileTypes: [],
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

  it('should call non-applications advanced search to retrieve Non-Applications', async () => {
    const mockSearchRequestDto: NonApplicationsSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
    };

    const result = await controller.advancedSearchNonApplications(
      mockSearchRequestDto,
    );

    expect(
      mockNonApplicationsAdvancedSearchService.searchNonApplications,
    ).toBeCalledTimes(1);
    expect(
      mockNonApplicationsAdvancedSearchService.searchNonApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call advanced search to retrieve Applications only when application file type selected', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      applicationFileTypes: ['NFUP'],
    };

    const result = await controller.advancedSearch(
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

  it('should call advanced search to retrieve NOIs only when NOI file type selected', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      applicationFileTypes: ['NOI'],
    };

    const result = await controller.advancedSearch(
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

  it('should call advanced search to retrieve Non Applications only when non application file type selected', async () => {
    const mockSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      isIncludeOtherParcels: false,
      applicationFileTypes: ['COV'],
    };

    const result = await controller.advancedSearch(
      mockSearchRequestDto as SearchRequestDto,
    );

    expect(result.totalNoticeOfIntents).toBe(0);

    expect(
      mockNonApplicationsAdvancedSearchService.searchNonApplications,
    ).toBeCalledTimes(1);
    expect(
      mockNonApplicationsAdvancedSearchService.searchNonApplications,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.nonApplications).toBeDefined();
    expect(result.totalNonApplications).toBe(0);
  });
});
