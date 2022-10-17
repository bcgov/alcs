import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../application/application.service';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { BoardAutomapperProfile } from '../common/automapper/board.automapper.profile';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { PlanningReviewController } from '../planning-review/planning-review.controller';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;

  let boardService: DeepMocked<BoardService>;
  let appService: DeepMocked<ApplicationService>;
  let appReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let cardService: DeepMocked<CardService>;
  let planningReviewService: DeepMocked<PlanningReviewService>;

  beforeEach(async () => {
    boardService = createMock<BoardService>();
    appService = createMock<ApplicationService>();
    appReconsiderationService = createMock<ApplicationReconsiderationService>();
    planningReviewService = createMock<PlanningReviewService>();
    cardService = createMock<CardService>();

    boardService.getApplicationsByCode.mockResolvedValue([]);
    appService.mapToDtos.mockResolvedValue([]);
    appReconsiderationService.getByBoardCode.mockResolvedValue([]);
    appReconsiderationService.mapToDtos.mockResolvedValue([]);
    planningReviewService.getCards.mockResolvedValue([]);
    planningReviewService.mapToDtos.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        { provide: BoardService, useValue: boardService },
        { provide: ApplicationService, useValue: appService },
        {
          provide: ApplicationReconsiderationService,
          useValue: appReconsiderationService,
        },
        { provide: CardService, useValue: cardService },
        {
          provide: PlanningReviewService,
          useValue: planningReviewService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        BoardAutomapperProfile,
        ...mockKeyCloakProviders,
      ],
      controllers: [BoardController],
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for get', async () => {
    boardService.list.mockResolvedValue([]);

    await controller.getBoards();

    expect(boardService.list).toHaveBeenCalled();
  });

  it('should call through to service for get apps', async () => {
    const boardCode = 'fake-board';

    await controller.getCards(boardCode);

    expect(boardService.getApplicationsByCode).toHaveBeenCalled();
    expect(boardService.getApplicationsByCode.mock.calls[0][0]).toEqual(
      boardCode,
    );
    expect(appService.mapToDtos).toHaveBeenCalled();
    expect(appReconsiderationService.mapToDtos).toHaveBeenCalled();
    expect(planningReviewService.getCards).not.toHaveBeenCalled();
    expect(planningReviewService.mapToDtos).toHaveBeenCalled();
  });

  it('should call through to planning meeting service for exec board', async () => {
    const boardCode = 'exec';

    await controller.getCards(boardCode);

    expect(planningReviewService.getCards).toHaveBeenCalled();
    expect(planningReviewService.mapToDtos).toHaveBeenCalled();
  });

  it('should call through to service when changing boards', async () => {
    boardService.changeBoard.mockResolvedValue({} as Card);
    const boardCode = 'fake-board';
    const cardUuid = 'card-uuid';

    await controller.changeBoard({ cardUuid, boardCode });

    expect(boardService.changeBoard).toHaveBeenCalled();
    expect(boardService.changeBoard.mock.calls[0][0]).toEqual(cardUuid);
    expect(boardService.changeBoard.mock.calls[0][1]).toEqual(boardCode);
  });

  it('should call service with correct type when creating card', async () => {
    boardService.getOne.mockResolvedValue({} as Board);
    cardService.create.mockResolvedValue({} as Card);

    const boardCode = 'fake-board';
    const typeCode = 'fake-type';
    await controller.createCard({ typeCode, boardCode });

    expect(cardService.create).toHaveBeenCalledTimes(1);
    expect(cardService.create.mock.calls[0][0]).toEqual(typeCode);
    expect(cardService.create.mock.calls[0][1]).toEqual({});
  });

  it('should fail call create card when board does not exist', async () => {
    boardService.getOne.mockResolvedValue(undefined);
    cardService.create.mockResolvedValue({} as Card);

    const boardCode = 'fake-board';
    const typeCode = 'fake-type';
    await expect(
      controller.createCard({ typeCode, boardCode }),
    ).rejects.toMatchObject(
      new ServiceValidationException(`Board with code ${boardCode} not found`),
    );

    expect(cardService.create).toHaveBeenCalledTimes(0);
  });
});
