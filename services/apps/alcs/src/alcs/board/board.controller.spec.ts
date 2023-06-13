import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { BoardAutomapperProfile } from '../../common/automapper/board.automapper.profile';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../application/application.service';
import { CARD_TYPE, CardType } from '../card/card-type/card-type.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { CovenantService } from '../covenant/covenant.service';
import { NoticeOfIntentModificationService } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { BoardController } from './board.controller';
import { BOARD_CODES } from './board.dto';
import { Board } from './board.entity';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;

  let boardService: DeepMocked<BoardService>;
  let appService: DeepMocked<ApplicationService>;
  let appReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let modificationService: DeepMocked<ApplicationModificationService>;
  let cardService: DeepMocked<CardService>;
  let planningReviewService: DeepMocked<PlanningReviewService>;
  let covenantService: DeepMocked<CovenantService>;
  let noticeOfIntentService: DeepMocked<NoticeOfIntentService>;
  let noiModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockBoard;

  beforeEach(async () => {
    boardService = createMock();
    appService = createMock();
    appReconsiderationService = createMock();
    modificationService = createMock();
    planningReviewService = createMock();
    cardService = createMock();
    covenantService = createMock();
    noticeOfIntentService = createMock();
    noiModificationService = createMock();
    mockBoard = new Board({
      allowedCardTypes: [],
    });

    boardService.getOneOrFail.mockResolvedValue(mockBoard);
    appService.getByBoardCode.mockResolvedValue([]);
    appService.mapToDtos.mockResolvedValue([]);
    appReconsiderationService.getByBoardCode.mockResolvedValue([]);
    appReconsiderationService.mapToDtos.mockResolvedValue([]);
    planningReviewService.getByBoardCode.mockResolvedValue([]);
    planningReviewService.mapToDtos.mockResolvedValue([]);
    modificationService.getByBoardCode.mockResolvedValue([]);
    modificationService.mapToDtos.mockResolvedValue([]);
    covenantService.getByBoardCode.mockResolvedValue([]);
    covenantService.mapToDtos.mockResolvedValue([]);
    noticeOfIntentService.getByBoardCode.mockResolvedValue([]);
    noticeOfIntentService.mapToDtos.mockResolvedValue([]);
    noiModificationService.getByBoardCode.mockResolvedValue([]);
    noiModificationService.mapToDtos.mockResolvedValue([]);

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
          provide: ApplicationModificationService,
          useValue: modificationService,
        },
        { provide: CardService, useValue: cardService },
        {
          provide: PlanningReviewService,
          useValue: planningReviewService,
        },
        { provide: CovenantService, useValue: covenantService },
        {
          provide: NoticeOfIntentService,
          useValue: noticeOfIntentService,
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: noiModificationService,
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

    expect(boardService.list).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get apps', async () => {
    const boardCode = 'fake-board';
    mockBoard.allowedCardTypes = [
      new CardType({
        code: CARD_TYPE.APP,
      }),
    ];

    await controller.getCards(boardCode);

    expect(appService.getByBoardCode).toHaveBeenCalledTimes(1);
    expect(appService.getByBoardCode.mock.calls[0][0]).toEqual(boardCode);
    expect(appService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(appReconsiderationService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(modificationService.getByBoardCode).toHaveBeenCalledTimes(0);
    expect(modificationService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(planningReviewService.getByBoardCode).toHaveBeenCalledTimes(0);
    expect(planningReviewService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to planning review service if board supports planning reviews', async () => {
    const boardCode = 'exec';
    mockBoard.allowedCardTypes = [
      new CardType({
        code: CARD_TYPE.PLAN,
      }),
    ];

    await controller.getCards(boardCode);

    expect(planningReviewService.getByBoardCode).toHaveBeenCalledTimes(1);
    expect(planningReviewService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to modification service for boards that support it board', async () => {
    const boardCode = BOARD_CODES.CEO;
    mockBoard.allowedCardTypes = [
      new CardType({
        code: CARD_TYPE.APP_MODI,
      }),
    ];

    await controller.getCards(boardCode);

    expect(modificationService.getByBoardCode).toHaveBeenCalledTimes(1);
    expect(modificationService.mapToDtos).toHaveBeenCalledTimes(1);
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
    const typeCode = CARD_TYPE.APP;
    await controller.createCard({ typeCode: typeCode, boardCode });

    expect(cardService.create).toHaveBeenCalledTimes(1);
    expect(cardService.create.mock.calls[0][0]).toEqual(typeCode);
    expect(cardService.create.mock.calls[0][1]).toEqual({});
  });
});
