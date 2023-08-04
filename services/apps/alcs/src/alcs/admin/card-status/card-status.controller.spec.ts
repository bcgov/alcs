import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { BoardStatus } from '../../board/board-status.entity';
import { Board } from '../../board/board.entity';
import { BoardService } from '../../board/board.service';
import {
  CARD_STATUS,
  CardStatus,
} from '../../card/card-status/card-status.entity';
import { CardStatusService } from '../../card/card-status/card-status.service';
import { CardStatusController } from './card-status.controller';

describe('CardStatusController', () => {
  let controller: CardStatusController;
  let mockCardStatusService: DeepMocked<CardStatusService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockCardStatusService = createMock();
    mockBoardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardStatusController],
      providers: [
        {
          provide: CardStatusService,
          useValue: mockCardStatusService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<CardStatusController>(CardStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching card statuses', async () => {
    mockCardStatusService.fetch.mockResolvedValue([]);

    const cardStatuses = await controller.fetch();

    expect(cardStatuses).toBeDefined();
    expect(mockCardStatusService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating card status', async () => {
    mockCardStatusService.update.mockResolvedValue(new CardStatus());

    const holiday = await controller.update('fake', new CardStatus());

    expect(holiday).toBeDefined();
    expect(mockCardStatusService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating a card status', async () => {
    mockCardStatusService.create.mockResolvedValue(new CardStatus());

    const holiday = await controller.create(new CardStatus());

    expect(holiday).toBeDefined();
    expect(mockCardStatusService.create).toHaveBeenCalledTimes(1);
  });

  it('should return false when trying to delete a critical column', async () => {
    const res = await controller.canDelete(CARD_STATUS.READY_FOR_REVIEW);

    expect(res).toBeDefined();
    expect(res.canDelete).toBeFalsy();
  });

  it('should return false when trying to delete a column with cards in it', async () => {
    mockCardStatusService.getCardCountByStatus.mockResolvedValue(3);

    const res = await controller.canDelete('FAKE-CODE' as CARD_STATUS);

    expect(res).toBeDefined();
    expect(res.canDelete).toBeFalsy();
    expect(mockCardStatusService.getCardCountByStatus).toHaveBeenCalledTimes(1);
  });

  it('should return false when it is the last status on a board', async () => {
    mockCardStatusService.getCardCountByStatus.mockResolvedValue(0);
    mockBoardService.getBoardsWithStatus.mockResolvedValue([
      new Board({
        statuses: [new BoardStatus()],
      }),
    ]);

    const res = await controller.canDelete('FAKE-CODE' as CARD_STATUS);

    expect(res).toBeDefined();
    expect(res.canDelete).toBeFalsy();
    expect(mockBoardService.getBoardsWithStatus).toHaveBeenCalledTimes(1);
  });

  it('should return true for the happy path', async () => {
    mockCardStatusService.getCardCountByStatus.mockResolvedValue(0);
    mockBoardService.getBoardsWithStatus.mockResolvedValue([
      new Board({
        statuses: [new BoardStatus(), new BoardStatus()],
      }),
    ]);

    const res = await controller.canDelete('FAKE-CODE' as CARD_STATUS);

    expect(res).toBeDefined();
    expect(res.canDelete).toBeTruthy();
    expect(mockBoardService.getBoardsWithStatus).toHaveBeenCalledTimes(1);
  });

  it('should call the service for delete', async () => {
    mockCardStatusService.delete.mockResolvedValue({} as any);

    const res = await controller.delete('FAKE-CODE');

    expect(res).toBeDefined();
    expect(mockCardStatusService.delete).toHaveBeenCalledTimes(1);
  });
});
