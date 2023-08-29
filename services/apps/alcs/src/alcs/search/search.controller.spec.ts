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
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let mockSearchService: DeepMocked<SearchService>;

  beforeEach(async () => {
    mockSearchService = createMock();

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to retrieve Application, Noi, Planning, Covenant', async () => {
    const searchString = 'fake';
    const result = await controller.search(searchString);

    expect(mockSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockSearchService.searchApplications).toBeCalledWith(searchString);
    expect(mockSearchService.getNoi).toBeCalledTimes(1);
    expect(mockSearchService.getNoi).toBeCalledWith(searchString);
    expect(mockSearchService.getPlanningReview).toBeCalledTimes(1);
    expect(mockSearchService.getPlanningReview).toBeCalledWith(searchString);
    expect(mockSearchService.getCovenant).toBeCalledTimes(1);
    expect(mockSearchService.getCovenant).toBeCalledWith(searchString);
    expect(result).toBeDefined();
    expect(result.length).toBe(4);
  });
});
