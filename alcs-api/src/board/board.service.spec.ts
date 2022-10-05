import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { Board } from './board.entity';
import { BoardService } from './board.service';

describe('BoardsService', () => {
  let service: BoardService;
  let applicationService: DeepMocked<ApplicationService>;
  let cardService: DeepMocked<CardService>;
  let mockRepository: DeepMocked<Repository<Board>>;

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
    mockRepository = createMock<Repository<Board>>();
    cardService = createMock<CardService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: CardService,
          useValue: cardService,
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
    const cardUuid = '1512313';

    const zeroOrderStatus = {
      order: 0,
      status: { uuid: 'correct-status' },
      uuid: 's-uuid',
    };

    const mockBoard = {
      uuid: 'b-uuid',
      statuses: [{ order: 1 }, zeroOrderStatus, { order: 2 }],
    } as Board;

    cardService.get.mockResolvedValue({
      uuid: cardUuid,
      status: { uuid: 'fake-status' },
      board: { uuid: 'fake-board' },
    } as Card);
    mockRepository.findOne.mockResolvedValue(mockBoard);
    cardService.update.mockResolvedValue({} as Card);

    await service.changeBoard(cardUuid, boardCode);
    expect(cardService.get).toHaveBeenCalled();
    expect(mockRepository.findOne).toHaveBeenCalled();
    expect(cardService.update).toHaveBeenCalled();

    const updatedCardUuid = cardService.update.mock.calls[0][0];
    const updatedCard = cardService.update.mock.calls[0][1];
    expect(updatedCardUuid).toEqual(cardUuid);
    expect(updatedCard.boardUuid).toEqual(mockBoard.uuid);
    expect(updatedCard.statusUuid).toEqual(zeroOrderStatus.status.uuid);
  });

  it("should throw an exception when updating an card that doesn't exist", async () => {
    cardService.get.mockResolvedValue(undefined);

    await expect(
      service.changeBoard('card-uuid', 'board-code'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find card with uuid card-uuid'),
    );
  });

  it("should throw an exception when trying to set a board that doesn't exist", async () => {
    cardService.get.mockResolvedValue({} as Card);
    mockRepository.findOne.mockResolvedValue(undefined);

    await expect(
      service.changeBoard('file-number', 'board-code'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Failed to find Board with code board-code`),
    );
  });
});
