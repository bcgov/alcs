import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationService } from '../application/application.service';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { BoardAutomapperProfile } from '../common/automapper/board.automapper.profile';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { CovenantService } from '../covenant/covenant.service';
import { ApplicationAmendmentService } from '../decision/application-amendment/application-amendment.service';
import { ApplicationReconsiderationService } from '../decision/application-reconsideration/application-reconsideration.service';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;

  let boardService: DeepMocked<BoardService>;
  let appService: DeepMocked<ApplicationService>;
  let appReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let amendmentService: DeepMocked<ApplicationAmendmentService>;
  let cardService: DeepMocked<CardService>;
  let planningReviewService: DeepMocked<PlanningReviewService>;
  let covenantService: DeepMocked<CovenantService>;

  beforeEach(async () => {
    boardService = createMock<BoardService>();
    appService = createMock<ApplicationService>();
    appReconsiderationService = createMock<ApplicationReconsiderationService>();
    amendmentService = createMock<ApplicationAmendmentService>();
    planningReviewService = createMock<PlanningReviewService>();
    cardService = createMock<CardService>();
    covenantService = createMock<CovenantService>();

    boardService.getApplicationsByCode.mockResolvedValue([]);
    appService.mapToDtos.mockResolvedValue([]);
    appReconsiderationService.getByBoardCode.mockResolvedValue([]);
    appReconsiderationService.mapToDtos.mockResolvedValue([]);
    planningReviewService.getCards.mockResolvedValue([]);
    planningReviewService.mapToDtos.mockResolvedValue([]);
    amendmentService.getByBoardCode.mockResolvedValue([]);
    amendmentService.mapToDtos.mockResolvedValue([]);
    covenantService.getByBoardCode.mockResolvedValue([]);
    covenantService.mapToDtos.mockResolvedValue([]);

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
        {
          provide: ApplicationAmendmentService,
          useValue: amendmentService,
        },
        { provide: CardService, useValue: cardService },
        {
          provide: PlanningReviewService,
          useValue: planningReviewService,
        },
        { provide: CovenantService, useValue: covenantService },
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

    expect(boardService.list).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get apps', async () => {
    const boardCode = 'fake-board';

    await controller.getCards(boardCode);

    expect(boardService.getApplicationsByCode).toHaveBeenCalledTimes(1);
    expect(boardService.getApplicationsByCode.mock.calls[0][0]).toEqual(
      boardCode,
    );
    expect(appService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(appReconsiderationService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(amendmentService.getByBoardCode).toHaveBeenCalledTimes(0);
    expect(amendmentService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(planningReviewService.getCards).toHaveBeenCalledTimes(0);
    expect(planningReviewService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to planning review service for exec board', async () => {
    const boardCode = 'exec';

    await controller.getCards(boardCode);

    expect(planningReviewService.getCards).toHaveBeenCalledTimes(1);
    expect(planningReviewService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to amendment service for ceo board', async () => {
    const boardCode = 'ceo';

    await controller.getCards(boardCode);

    expect(amendmentService.getByBoardCode).toHaveBeenCalledTimes(1);
    expect(amendmentService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service when changing boards', async () => {
    boardService.changeBoard.mockResolvedValue({} as Card);
    const boardCode = 'fake-board';
    const cardUuid = 'card-uuid';

    await controller.changeBoard({ cardUuid, boardCode });

    expect(boardService.changeBoard).toHaveBeenCalledTimes(1);
    expect(boardService.changeBoard.mock.calls[0][0]).toEqual(cardUuid);
    expect(boardService.changeBoard.mock.calls[0][1]).toEqual(boardCode);
  });

  it('should call service with correct type when creating card', async () => {
    boardService.getOneOrFail.mockResolvedValue({} as Board);
    cardService.create.mockResolvedValue({} as Card);

    const boardCode = 'fake-board';
    const typeCode = 'fake-type';
    await controller.createCard({ typeCode, boardCode });

    expect(cardService.create).toHaveBeenCalledTimes(1);
    expect(cardService.create.mock.calls[0][0]).toEqual(typeCode);
    expect(cardService.create.mock.calls[0][1]).toEqual({});
  });
});
