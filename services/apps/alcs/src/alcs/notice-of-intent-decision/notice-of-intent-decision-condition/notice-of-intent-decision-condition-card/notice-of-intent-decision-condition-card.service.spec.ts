import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { NoticeOfIntentDecisionConditionCardService } from './notice-of-intent-decision-condition-card.service';
import { NoticeOfIntentDecisionConditionService } from '../notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionV2Service } from '../../notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { BoardService } from '../../../board/board.service';
import { CardService } from '../../../card/card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionConditionCard } from './notice-of-intent-decision-condition-card.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { Mapper } from 'automapper-core';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { Card } from '../../../card/card.entity';
import { NoticeOfIntentModificationService } from '../../notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionProfile } from '../../../../common/automapper/notice-of-intent-decision.automapper.profile';
import { NoticeOfIntentProfile } from '../../../../common/automapper/notice-of-intent.automapper.profile';

describe('NoticeOfIntentDecisionConditionCardService', () => {
  let service: NoticeOfIntentDecisionConditionCardService;
  let mockRepository: DeepMocked<Repository<NoticeOfIntentDecisionConditionCard>>;
  let mockConditionService: DeepMocked<NoticeOfIntentDecisionConditionService>;
  let mockDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockCardService: DeepMocked<CardService>;
  let mockModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockMapper: DeepMocked<Mapper>;

  const CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  const BOARD_CARD_RELATIONS = {
    card: CARD_RELATIONS,
    conditions: true,
    decision: {
      noticeOfIntent: {
        type: true,
      },
    },
  };

  const DEFAULT_RELATIONS = {
    conditions: true,
    card: CARD_RELATIONS,
    decision: {
      noticeOfIntent: true,
    },
  };

  beforeEach(async () => {
    mockRepository = createMock();
    mockConditionService = createMock();
    mockDecisionService = createMock();
    mockBoardService = createMock();
    mockCardService = createMock();
    mockModificationService = createMock();
    mockMapper = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentDecisionConditionCardService,
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionConditionCard),
          useValue: mockRepository,
        },
        {
          provide: NoticeOfIntentDecisionConditionService,
          useValue: mockConditionService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockModificationService,
        },
        NoticeOfIntentDecisionProfile,
        NoticeOfIntentProfile,
      ],
    }).compile();

    service = module.get<NoticeOfIntentDecisionConditionCardService>(NoticeOfIntentDecisionConditionCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new condition card', async () => {
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        decisionUuid: 'decision-uuid',
        cardStatusCode: 'status-code',
      };
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'status-code' }] } as any;
      const decision = { uuid: 'decision-uuid' } as any;
      const card = { uuid: 'card-uuid' } as any;
      const conditions = [{ uuid: 'condition-uuid-1' }, { uuid: 'condition-uuid-2' }] as any;

      mockBoardService.getNoticeOfIntentDecisionConditionBoard.mockResolvedValue(board);
      mockDecisionService.get.mockResolvedValue(decision);
      mockCardService.save.mockResolvedValue(card);
      mockConditionService.findByUuids.mockResolvedValue(conditions);
      mockRepository.save.mockResolvedValue({ uuid: 'new-card-uuid' } as any);

      const result = await service.create(dto);

      expect(mockBoardService.getNoticeOfIntentDecisionConditionBoard).toHaveBeenCalled();
      expect(mockDecisionService.get).toHaveBeenCalledWith(dto.decisionUuid);
      expect(mockCardService.save).toHaveBeenCalled();
      expect(mockConditionService.findByUuids).toHaveBeenCalledWith(dto.conditionsUuids);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.uuid).toEqual('new-card-uuid');
    });

    it('should throw an error if board is not found', async () => {
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        decisionUuid: 'decision-uuid',
        cardStatusCode: 'status-code',
      };

      mockBoardService.getNoticeOfIntentDecisionConditionBoard.mockRejectedValue(
        new ServiceNotFoundException('Board not found'),
      );

      await expect(service.create(dto)).rejects.toThrow(ServiceNotFoundException);
    });

    it('should throw an error if decision is not found', async () => {
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        decisionUuid: 'decision-uuid',
        cardStatusCode: 'status-code',
      };
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'status-code' }] } as any;

      mockBoardService.getNoticeOfIntentDecisionConditionBoard.mockResolvedValue(board);
      mockDecisionService.get.mockRejectedValue(
        new ServiceNotFoundException('Failed to fetch decision with uuid decision-uuid'),
      );

      await expect(service.create(dto)).rejects.toThrow(ServiceNotFoundException);
    });

    it('should throw an error if conditions are not found', async () => {
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        decisionUuid: 'decision-uuid',
        cardStatusCode: 'status-code',
      };
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'status-code' }] } as any;
      const decision = { uuid: 'decision-uuid' } as any;
      const card = { uuid: 'card-uuid' } as any;

      mockBoardService.getNoticeOfIntentDecisionConditionBoard.mockResolvedValue(board);
      mockDecisionService.get.mockResolvedValue(decision);
      mockCardService.save.mockResolvedValue(card);
      mockConditionService.findByUuids.mockResolvedValue([]);

      await expect(service.create(dto)).rejects.toThrow(ServiceValidationException);
    });
  });

  describe('get', () => {
    it('should return a condition card', async () => {
      const uuid = 'example-uuid';
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      mockRepository.findOne.mockResolvedValue(conditionCard);

      const result = await service.get(uuid);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { uuid },
        relations: DEFAULT_RELATIONS,
      });
      expect(result).toEqual(conditionCard);
    });

    it('should throw an error if condition card is not found', async () => {
      const uuid = 'example-uuid';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.get(uuid)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('update', () => {
    it('should update the condition card', async () => {
      const uuid = 'example-uuid';
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        cardStatusCode: 'updated-status-code',
      };
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      conditionCard.card = new Card();
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'updated-status-code' }] } as any;
      const conditions = [{ uuid: 'condition-uuid-1' }, { uuid: 'condition-uuid-2' }] as any;

      mockRepository.findOne.mockResolvedValue(conditionCard);
      mockBoardService.getNoticeOfIntentDecisionConditionBoard.mockResolvedValue(board);
      mockConditionService.findByUuids.mockResolvedValue(conditions);
      mockRepository.save.mockResolvedValue(conditionCard);

      const result = await service.update(uuid, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { uuid },
        relations: DEFAULT_RELATIONS,
      });
      expect(mockBoardService.getNoticeOfIntentDecisionConditionBoard).toHaveBeenCalled();
      expect(mockConditionService.findByUuids).toHaveBeenCalledWith(dto.conditionsUuids);
      expect(mockRepository.save).toHaveBeenCalledWith(conditionCard);
      expect(result).toEqual(conditionCard);
    });

    it('should throw an error if condition card is not found', async () => {
      const uuid = 'example-uuid';
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        cardStatusCode: 'updated-status-code',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(uuid, dto)).rejects.toThrow(ServiceNotFoundException);
    });

    it('should throw an error if conditions are not found', async () => {
      const uuid = 'example-uuid';
      const dto = {
        conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
        cardStatusCode: 'updated-status-code',
      };
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'updated-status-code' }] } as any;

      mockRepository.findOne.mockResolvedValue(conditionCard);
      mockBoardService.getNoticeOfIntentDecisionConditionBoard.mockResolvedValue(board);
      mockConditionService.findByUuids.mockResolvedValue([]);

      await expect(service.update(uuid, dto)).rejects.toThrow(ServiceValidationException);
    });
  });

  describe('getByBoard', () => {
    it('should return condition cards by board uuid', async () => {
      const boardUuid = 'board-uuid';
      const conditionCards = [new NoticeOfIntentDecisionConditionCard()];
      mockRepository.find.mockResolvedValue(conditionCards);

      const result = await service.getByBoard(boardUuid);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { card: { boardUuid } },
        relations: service.BOARD_CARD_RELATIONS,
      });
      expect(result).toEqual(conditionCards);
    });
  });

  describe('getByBoardCard', () => {
    it('should return a condition card by board card uuid', async () => {
      const uuid = 'example-uuid';
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      mockRepository.findOne.mockResolvedValue(conditionCard);

      const result = await service.getByBoardCard(uuid);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cardUuid: uuid },
        relations: service.BOARD_CARD_RELATIONS,
      });
      expect(result).toEqual(conditionCard);
    });

    it('should throw an error if condition card is not found', async () => {
      const uuid = 'example-uuid';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getByBoardCard(uuid)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('softRemove', () => {
    it('should soft remove a condition card', async () => {
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      conditionCard.cardUuid = 'card-uuid';
      const card = new Card();

      mockCardService.get.mockResolvedValue(card);
      mockCardService.softRemoveByUuid.mockResolvedValue();
      mockRepository.softRemove.mockResolvedValue(conditionCard);

      const result = await service.softRemove(conditionCard);

      expect(mockCardService.get).toHaveBeenCalledWith(conditionCard.cardUuid);
      expect(mockCardService.softRemoveByUuid).toHaveBeenCalledWith(card.uuid);
      expect(mockRepository.softRemove).toHaveBeenCalledWith(conditionCard);
      expect(result).toEqual(conditionCard);
    });

    it('should throw an error if card is not found', async () => {
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      conditionCard.cardUuid = 'card-uuid';

      mockCardService.get.mockResolvedValue(null);

      await expect(service.softRemove(conditionCard)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('archiveByBoardCard', () => {
    it('should archive a condition card by board card uuid', async () => {
      const boardCardUuid = 'example-uuid';
      const conditionCard = new NoticeOfIntentDecisionConditionCard();
      conditionCard.conditions = [];

      mockRepository.findOne.mockResolvedValue(conditionCard);
      mockRepository.save.mockResolvedValue(conditionCard);
      mockRepository.softRemove.mockResolvedValue(conditionCard);

      await service.archiveByBoardCard(boardCardUuid);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cardUuid: boardCardUuid },
        relations: service.BOARD_CARD_RELATIONS,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(conditionCard);
      expect(mockRepository.softRemove).toHaveBeenCalledWith(conditionCard);
    });

    it('should throw an error if condition card is not found', async () => {
      const boardCardUuid = 'example-uuid';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.archiveByBoardCard(boardCardUuid)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('recoverByBoardCard', () => {
    it('should recover a condition card by board card uuid', async () => {
      const boardCardUuid = 'example-uuid';
      const conditionCard = new NoticeOfIntentDecisionConditionCard();

      mockRepository.findOne.mockResolvedValue(conditionCard);
      mockRepository.recover.mockResolvedValue(conditionCard);

      await service.recoverByBoardCard(boardCardUuid);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cardUuid: boardCardUuid },
        withDeleted: true,
        relations: service.DEFAULT_RELATIONS,
      });
      expect(mockRepository.recover).toHaveBeenCalledWith(conditionCard);
    });

    it('should throw an error if condition card is not found', async () => {
      const boardCardUuid = 'example-uuid';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.recoverByBoardCard(boardCardUuid)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('getDeletedCards', () => {
    it('should return deleted condition cards by file number', async () => {
      const fileNumber = 'example-file-number';
      const conditionCards = [new NoticeOfIntentDecisionConditionCard()];

      mockRepository.find.mockResolvedValue(conditionCards);

      const result = await service.getDeletedCards(fileNumber);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          decision: {
            noticeOfIntent: {
              fileNumber,
            },
            auditDeletedDateAt: IsNull(),
          },
          card: {
            auditDeletedDateAt: Not(IsNull()),
          },
        },
        withDeleted: true,
        relations: {
          decision: {
            noticeOfIntent: true,
          },
          card: service.CARD_RELATIONS,
        },
      });
      expect(result).toEqual(conditionCards);
    });
  });
});
