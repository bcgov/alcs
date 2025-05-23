import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { CARD_STATUS } from '../card/card-status/card-status.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { BoardStatus } from './board-status.entity';
import { Board } from './board.entity';
import { BoardService } from './board.service';

describe('BoardsService', () => {
  let service: BoardService;
  let applicationService: DeepMocked<ApplicationService>;
  let cardService: DeepMocked<CardService>;
  let mockBoardRepository: DeepMocked<Repository<Board>>;
  let mockBoardStatusRepository: DeepMocked<Repository<BoardStatus>>;

  beforeEach(async () => {
    applicationService = createMock();
    mockBoardRepository = createMock();
    cardService = createMock();
    mockBoardStatusRepository = createMock();

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
          useValue: mockBoardRepository,
        },
        {
          provide: getRepositoryToken(BoardStatus),
          useValue: mockBoardStatusRepository,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo when list is called', async () => {
    mockBoardRepository.find.mockResolvedValue([]);

    await service.list();
    expect(mockBoardRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should set the applications status to the 0 rank when changing board', async () => {
    const boardCode = 'board-code';
    const cardUuid = '1512313';

    const zeroOrderStatus = {
      order: 0,
      status: { code: 'correct-status' },
      uuid: 's-uuid',
    };

    const mockBoard = {
      uuid: 'b-uuid',
      statuses: [{ order: 1 }, zeroOrderStatus, { order: 2 }],
    } as Board;

    cardService.get.mockResolvedValue({
      uuid: cardUuid,
      status: { code: 'fake-status' },
      board: { uuid: 'fake-board' },
    } as Card);
    cardService.save.mockResolvedValue(new Card());
    mockBoardRepository.findOne.mockResolvedValue(mockBoard);
    cardService.update.mockResolvedValue({} as Card);

    await service.changeBoard(cardUuid, boardCode);
    expect(cardService.get).toHaveBeenCalledTimes(1);
    expect(mockBoardRepository.findOne).toHaveBeenCalledTimes(1);
    expect(cardService.save).toHaveBeenCalledTimes(1);

    const updatedCard = cardService.save.mock.calls[0][0];
    expect(updatedCard.board.uuid).toEqual(mockBoard.uuid);
    expect(updatedCard.status.code).toEqual(zeroOrderStatus.status.code);
  });

  it("should throw an exception when updating an card that doesn't exist", async () => {
    cardService.get.mockResolvedValue(null);

    await expect(service.changeBoard('card-uuid', 'board-code')).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find card with uuid card-uuid'),
    );
  });

  it("should throw an exception when trying to set a board that doesn't exist", async () => {
    cardService.get.mockResolvedValue({} as Card);
    mockBoardRepository.findOne.mockResolvedValue(null);

    await expect(service.changeBoard('file-number', 'board-code')).rejects.toMatchObject(
      new ServiceNotFoundException(`Failed to find Board with code board-code`),
    );
  });

  it('should call through for unlink status', async () => {
    mockBoardStatusRepository.delete.mockResolvedValue({} as any);

    await service.unlinkStatus('code');

    expect(mockBoardStatusRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through for getOneOrFail', async () => {
    mockBoardRepository.findOneOrFail.mockResolvedValue({} as any);

    await service.getOneOrFail({});

    expect(mockBoardRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through for getBoardsWithStatus', async () => {
    mockBoardRepository.find.mockResolvedValue([]);

    await service.getBoardsWithStatus(CARD_STATUS.READY_FOR_REVIEW);

    expect(mockBoardRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should delete the status links then remove the board for delete', async () => {
    mockBoardRepository.findOneOrFail.mockResolvedValue(new Board());
    mockBoardRepository.remove.mockResolvedValue({} as any);
    mockBoardStatusRepository.delete.mockResolvedValue({} as any);

    await service.delete('board-code');

    expect(mockBoardRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockBoardStatusRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockBoardRepository.remove).toHaveBeenCalledTimes(1);
  });

  it('should save both the board and updated status when creating or updating', async () => {
    cardService.getCardTypes.mockResolvedValue([]);
    mockBoardRepository.save.mockResolvedValue(new Board());
    mockBoardStatusRepository.delete.mockResolvedValue({} as any);
    mockBoardStatusRepository.save.mockResolvedValue([] as any);
    mockBoardRepository.exists.mockResolvedValue(false);

    await service.create({
      allowedCardTypes: [],
      code: '',
      createCardTypes: [],
      showOnSchedule: false,
      hasAssigneeFilter: false,
      statuses: [],
      title: '',
    });

    expect(cardService.getCardTypes).toHaveBeenCalledTimes(1);
    expect(mockBoardRepository.save).toHaveBeenCalledTimes(1);
    expect(mockBoardStatusRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockBoardStatusRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if code already exists when creating new board entry', async () => {
    mockBoardRepository.exists.mockResolvedValue(true);

    await expect(
      service.create({
        allowedCardTypes: [],
        code: 'SAMPLE',
        createCardTypes: [],
        showOnSchedule: false,
        hasAssigneeFilter: false,
        statuses: [],
        title: '',
      }),
    ).rejects.toThrow(ServiceValidationException);
  });
});
