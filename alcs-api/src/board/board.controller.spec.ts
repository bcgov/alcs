import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { BoardAutomapperProfile } from '../common/automapper/board.automapper.profile';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;

  let boardService: DeepMocked<BoardService>;
  let appService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    boardService = createMock<BoardService>();
    appService = createMock<ApplicationService>();

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

    const boardCode = 'fake-board';
    await controller.getApplications(boardCode);

    expect(boardService.getApplicationsByCode).toHaveBeenCalled();
    expect(boardService.getApplicationsByCode.mock.calls[0][0]).toEqual(
      boardCode,
    );
    expect(appService.mapToDtos).toHaveBeenCalled();
  });

  it('should call through to service when changing boards', async () => {
    boardService.changeBoard.mockResolvedValue({} as Application);

    const boardCode = 'fake-board';
    const fileNumber = 'file-number';
    await controller.changeApplicationBoard({ fileNumber, boardCode });

    expect(boardService.changeBoard).toHaveBeenCalled();
    expect(boardService.changeBoard.mock.calls[0][0]).toEqual(fileNumber);
    expect(boardService.changeBoard.mock.calls[0][1]).toEqual(boardCode);
  });
});
