import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { BoardService } from '../../board/board.service';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { BoardManagementController } from './board-management.controller';

describe('BoardManagementController', () => {
  let controller: BoardManagementController;
  let mockCardService: DeepMocked<CardService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockBoardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardManagementController],
      providers: [
        {
          provide: CardService,
          useValue: mockCardService,
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

    controller = module.get<BoardManagementController>(
      BoardManagementController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for get card type', async () => {
    mockCardService.getCardTypes.mockResolvedValue([]);

    await controller.fetchCardTypes();

    expect(mockCardService.getCardTypes).toHaveBeenCalledTimes(1);
  });

  it('should call through for update', async () => {
    mockBoardService.update.mockResolvedValue();

    await controller.update('code', {
      allowedCardTypes: [],
      code: '',
      createCardTypes: [],
      showOnSchedule: false,
      statuses: [],
      title: '',
    });

    expect(mockBoardService.update).toHaveBeenCalledTimes(1);
  });

  it('should call through for create', async () => {
    mockBoardService.create.mockResolvedValue();

    await controller.create({
      allowedCardTypes: [],
      code: '',
      createCardTypes: [],
      showOnSchedule: false,
      statuses: [],
      title: '',
    });

    expect(mockBoardService.create).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete when board has no cards', async () => {
    mockCardService.getByBoard.mockResolvedValue([]);
    mockBoardService.delete.mockResolvedValue();

    await controller.delete('code');

    expect(mockCardService.getByBoard).toHaveBeenCalledTimes(1);
    expect(mockBoardService.delete).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception for delete when board has cards', async () => {
    mockCardService.getByBoard.mockResolvedValue([new Card()]);

    const promise = controller.delete('code');
    await expect(promise).rejects.toMatchObject(
      new ServiceValidationException('Cannot delete boards with cards'),
    );

    expect(mockCardService.getByBoard).toHaveBeenCalledTimes(1);
    expect(mockBoardService.delete).toHaveBeenCalledTimes(0);
  });

  it('should return card counts', async () => {
    const mockCards = [
      { statusCode: 'status1' },
      { statusCode: 'status2' },
      { statusCode: 'status1' },
    ];
    mockCardService.getByBoard.mockResolvedValue(mockCards as Card[]);

    const result = await controller.fetchCardCount('code');

    expect(result).toEqual({ status1: 2, status2: 1 });
  });

  describe('canDelete', () => {
    it('should allow board deletion if code is not "vett" and no cards on the board', async () => {
      mockCardService.getByBoard.mockResolvedValue([]);

      const result = await controller.canDelete('code');

      expect(result).toEqual({ canDelete: true });
    });

    it('should disallow board deletion if code is "vett"', async () => {
      const result = await controller.canDelete('vett');

      expect(result).toEqual({
        canDelete: false,
        reason:
          'Board is critical to application functionality and can never be deleted',
      });
    });

    it('should disallow board deletion if cards are present on the board', async () => {
      mockCardService.getByBoard.mockResolvedValue([new Card()]);

      const result = await controller.canDelete('code');

      expect(result).toEqual({
        canDelete: false,
        reason: 'Board has cards on it, please move cards in order to delete',
      });
    });
  });
});
