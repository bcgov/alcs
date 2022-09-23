import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { Board } from './board.entity';
import { BoardService } from './board.service';

describe('BoardsService', () => {
  let service: BoardService;
  let applicationService: DeepMocked<ApplicationService>;
  let mockRepository: DeepMocked<Repository<Board>>;

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
    mockRepository = createMock<Repository<Board>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo when list is called', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.list();
    expect(mockRepository.find).toHaveBeenCalled();
  });

  it('should call app service to get apps with board code', async () => {
    applicationService.getAll.mockResolvedValue([]);

    const boardCode = 'board-code';
    await service.getApplicationsByCode(boardCode);
    expect(applicationService.getAll).toHaveBeenCalled();
    expect(applicationService.getAll.mock.calls[0][0]).toEqual({
      card: {
        board: {
          code: boardCode,
        },
      },
    });
  });

  it('should set the applications status to the 0 rank when changing board', async () => {
    const boardCode = 'board-code';
    const fileNumber = '1512313';

    const zeroOrderStatus = {
      order: 0,
      status: 'correct-status',
    };

    const mockBoard = {
      statuses: [{ order: 1 }, zeroOrderStatus, { order: 2 }],
    } as Board;

    applicationService.get.mockResolvedValue({
      card: { status: {} },
    } as Application);
    mockRepository.findOne.mockResolvedValue(mockBoard);
    applicationService.createOrUpdate.mockResolvedValue({} as Application);

    await service.changeBoard(fileNumber, boardCode);
    expect(applicationService.get).toHaveBeenCalled();
    expect(mockRepository.findOne).toHaveBeenCalled();
    expect(applicationService.createOrUpdate).toHaveBeenCalled();

    const updatedApp = applicationService.createOrUpdate.mock.calls[0][0];
    expect(updatedApp.card.board).toEqual(mockBoard);
    expect(updatedApp.card.status).toEqual(zeroOrderStatus.status);
  });

  it("should throw an exception when updating an app that doesn't exist", async () => {
    applicationService.get.mockResolvedValue(undefined);

    await expect(
      service.changeBoard('file-number', 'board-code'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to find application with fileNumber file-number`,
      ),
    );
  });

  it("should throw an exception when trying to set a board that doesn't exist", async () => {
    applicationService.get.mockResolvedValue({} as Application);
    mockRepository.findOne.mockResolvedValue(undefined);

    await expect(
      service.changeBoard('file-number', 'board-code'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Failed to find Board with code board-code`),
    );
  });
});
