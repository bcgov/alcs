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
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;

  let boardService: DeepMocked<BoardService>;
  let appService: DeepMocked<ApplicationService>;
  let cardService: DeepMocked<CardService>;

  beforeEach(async () => {
    boardService = createMock<BoardService>();
    appService = createMock<ApplicationService>();
    cardService = createMock<CardService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        { provide: BoardService, useValue: boardService },
        { provide: ApplicationService, useValue: appService },
        { provide: CardService, useValue: cardService },
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
    boardService.getApplicationsByCode.mockResolvedValue([]);
    appService.mapToDtos.mockResolvedValue([]);
    cardService.mapToDtos.mockResolvedValue([]);
    cardService.getByBoard.mockResolvedValue([]);

    const boardCode = 'fake-board';
    await controller.getCards(boardCode);

    expect(boardService.getApplicationsByCode).toHaveBeenCalled();
    expect(boardService.getApplicationsByCode.mock.calls[0][0]).toEqual(
      boardCode,
    );
    expect(appService.mapToDtos).toHaveBeenCalled();
    expect(cardService.mapToDtos).toHaveBeenCalled();
    expect(cardService.getByBoard).toHaveBeenCalled();
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
});
