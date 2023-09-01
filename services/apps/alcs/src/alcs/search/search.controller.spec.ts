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
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { CovenantAdvancedSearchService } from './covenant/covenant-advanced-search.service';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { PlanningReviewAdvancedService } from './planning-review/planning-review-advanced-search.service';
import { SearchController } from './search.controller';
import {
  AdvancedSearchResultDto,
  CovenantSearchRequestDto,
  PlanningReviewSearchRequestDto,
  SearchRequestDto,
} from './search.dto';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let mockSearchService: DeepMocked<SearchService>;
  let mockNoticeOfIntentAdvancedSearchService: DeepMocked<NoticeOfIntentAdvancedSearchService>;
  let mockApplicationAdvancedSearchService: DeepMocked<ApplicationAdvancedSearchService>;
  let mockPlanningReviewAdvancedService: DeepMocked<PlanningReviewAdvancedService>;
  let mockCovenantAdvancedSearchService: DeepMocked<CovenantAdvancedSearchService>;

  beforeEach(async () => {
    mockSearchService = createMock();
    mockNoticeOfIntentAdvancedSearchService = createMock();
    mockApplicationAdvancedSearchService = createMock();
    mockPlanningReviewAdvancedService = createMock();
    mockCovenantAdvancedSearchService = createMock();

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
          provide: PlanningReviewAdvancedService,
          useValue: mockPlanningReviewAdvancedService,
        },
        {
          provide: CovenantAdvancedSearchService,
          useValue: mockCovenantAdvancedSearchService,
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

    const mockPlanningReviewResult = new AdvancedSearchResultDto<
      PlanningReview[]
    >();
    mockPlanningReviewResult.data = new Array<PlanningReview>();
    mockPlanningReviewResult.total = 0;
    mockPlanningReviewAdvancedService.searchPlanningReviews.mockResolvedValue(
      mockPlanningReviewResult,
    );

    const mockCovenantResult = new AdvancedSearchResultDto<Covenant[]>();
    mockCovenantResult.data = new Array<Covenant>();
    mockCovenantResult.total = 0;
    mockCovenantAdvancedSearchService.searchCovenants.mockResolvedValue(
      mockCovenantResult,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to retrieve Application, Noi, Planning, Covenant by file number', async () => {
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
    expect(result).toBeDefined();
    expect(result.length).toBe(4);
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
      mockPlanningReviewAdvancedService.searchPlanningReviews,
    ).toBeCalledTimes(1);
    expect(
      mockPlanningReviewAdvancedService.searchPlanningReviews,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);

    expect(mockCovenantAdvancedSearchService.searchCovenants).toBeCalledTimes(
      1,
    );
    expect(mockCovenantAdvancedSearchService.searchCovenants).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.covenants).toBeDefined();
    expect(result.totalCovenants).toBe(0);
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

  it('should call planning review advanced search to retrieve Planning Reviews', async () => {
    const mockSearchRequestDto: PlanningReviewSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
    };

    const result = await controller.advancedSearchPlanningReviews(
      mockSearchRequestDto,
    );

    expect(
      mockPlanningReviewAdvancedService.searchPlanningReviews,
    ).toBeCalledTimes(1);
    expect(
      mockPlanningReviewAdvancedService.searchPlanningReviews,
    ).toBeCalledWith(mockSearchRequestDto);
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call covenant advanced search to retrieve Covenants', async () => {
    const mockSearchRequestDto: CovenantSearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
    };

    const result = await controller.advancedSearchCovenants(
      mockSearchRequestDto,
    );

    expect(mockCovenantAdvancedSearchService.searchCovenants).toBeCalledTimes(
      1,
    );
    expect(mockCovenantAdvancedSearchService.searchCovenants).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });
});
