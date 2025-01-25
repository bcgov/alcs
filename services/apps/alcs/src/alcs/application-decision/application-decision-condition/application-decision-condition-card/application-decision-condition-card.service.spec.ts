import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ApplicationDecisionConditionCardService } from './application-decision-condition-card.service';
import { ApplicationDecisionConditionService } from '../application-decision-condition.service';
import { ApplicationDecisionV2Service } from '../../application-decision-v2/application-decision/application-decision-v2.service';
import { BoardService } from '../../../board/board.service';
import { CardService } from '../../../card/card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationDecisionConditionCard } from './application-decision-condition-card.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { Mapper } from 'automapper-core';
import { ApplicationDecisionProfile } from '../../../../common/automapper/application-decision-v2.automapper.profile';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { Card } from '../../../card/card.entity';
import { ApplicationProfile } from '../../../../common/automapper/application.automapper.profile';
import { ApplicationModificationService } from '../../application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-reconsideration/application-reconsideration.service';

describe('ApplicationDecisionConditionCardService', () => {
  let service: ApplicationDecisionConditionCardService;
  let mockRepository: DeepMocked<Repository<ApplicationDecisionConditionCard>>;
  let mockConditionService: DeepMocked<ApplicationDecisionConditionService>;
  let mockDecisionService: DeepMocked<ApplicationDecisionV2Service>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockCardService: DeepMocked<CardService>;
  let mockApplicationModificationService: DeepMocked<ApplicationModificationService>;
  let mockApplicationReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
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
      application: {
        type: true,
      },
    },
  };

  const DEFAULT_RELATIONS = {
    conditions: true,
    card: CARD_RELATIONS,
    decision: {
      application: true,
    },
  };

  beforeEach(async () => {
    mockRepository = createMock();
    mockConditionService = createMock();
    mockDecisionService = createMock();
    mockBoardService = createMock();
    mockCardService = createMock();
    mockApplicationModificationService = createMock();
    mockApplicationReconsiderationService = createMock();
    mockMapper = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionConditionCardService,
        {
          provide: getRepositoryToken(ApplicationDecisionConditionCard),
          useValue: mockRepository,
        },
        {
          provide: ApplicationDecisionConditionService,
          useValue: mockConditionService,
        },
        {
          provide: ApplicationDecisionV2Service,
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
          provide: ApplicationModificationService,
          useValue: mockApplicationModificationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockApplicationReconsiderationService,
        },
        ApplicationDecisionProfile,
        ApplicationProfile,
      ],
    }).compile();

    service = module.get<ApplicationDecisionConditionCardService>(ApplicationDecisionConditionCardService);
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

      mockBoardService.getApplicationDecisionConditionBoard.mockResolvedValue(board);
      mockDecisionService.get.mockResolvedValue(decision);
      mockCardService.save.mockResolvedValue(card);
      mockConditionService.findByUuids.mockResolvedValue(conditions);
      mockRepository.save.mockResolvedValue({ uuid: 'new-card-uuid' } as any);

      const result = await service.create(dto);

      expect(mockBoardService.getApplicationDecisionConditionBoard).toHaveBeenCalled();
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

      mockBoardService.getApplicationDecisionConditionBoard.mockRejectedValue(
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

      mockBoardService.getApplicationDecisionConditionBoard.mockResolvedValue(board);
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

      mockBoardService.getApplicationDecisionConditionBoard.mockResolvedValue(board);
      mockDecisionService.get.mockResolvedValue(decision);
      mockCardService.save.mockResolvedValue(card);
      mockConditionService.findByUuids.mockResolvedValue([]);

      await expect(service.create(dto)).rejects.toThrow(ServiceValidationException);
    });
  });

  describe('get', () => {
    it('should return a condition card', async () => {
      const uuid = 'example-uuid';
      const conditionCard = new ApplicationDecisionConditionCard();
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
      const conditionCard = new ApplicationDecisionConditionCard();
      conditionCard.card = new Card();
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'updated-status-code' }] } as any;
      const conditions = [{ uuid: 'condition-uuid-1' }, { uuid: 'condition-uuid-2' }] as any;

      mockRepository.findOne.mockResolvedValue(conditionCard);
      mockBoardService.getApplicationDecisionConditionBoard.mockResolvedValue(board);
      mockConditionService.findByUuids.mockResolvedValue(conditions);
      mockRepository.save.mockResolvedValue(conditionCard);

      const result = await service.update(uuid, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { uuid },
        relations: DEFAULT_RELATIONS,
      });
      expect(mockBoardService.getApplicationDecisionConditionBoard).toHaveBeenCalled();
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
      const conditionCard = new ApplicationDecisionConditionCard();
      const board = { uuid: 'board-uuid', statuses: [{ statusCode: 'updated-status-code' }] } as any;

      mockRepository.findOne.mockResolvedValue(conditionCard);
      mockBoardService.getApplicationDecisionConditionBoard.mockResolvedValue(board);
      mockConditionService.findByUuids.mockResolvedValue([]);

      await expect(service.update(uuid, dto)).rejects.toThrow(ServiceValidationException);
    });
  });

  describe('getByBoard', () => {
    it('should return condition cards by board uuid', async () => {
      const boardUuid = 'board-uuid';
      const conditionCards = [new ApplicationDecisionConditionCard()];
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
      const conditionCard = new ApplicationDecisionConditionCard();
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
      const conditionCard = new ApplicationDecisionConditionCard();
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
      const conditionCard = new ApplicationDecisionConditionCard();
      conditionCard.cardUuid = 'card-uuid';

      mockCardService.get.mockResolvedValue(null);

      await expect(service.softRemove(conditionCard)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('archiveByBoardCard', () => {
    it('should archive a condition card by board card uuid', async () => {
      const boardCardUuid = 'example-uuid';
      const conditionCard = new ApplicationDecisionConditionCard();
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
      const conditionCard = new ApplicationDecisionConditionCard();

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
      const conditionCards = [new ApplicationDecisionConditionCard()];

      mockRepository.find.mockResolvedValue(conditionCards);

      const result = await service.getDeletedCards(fileNumber);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          decision: {
            application: {
              fileNumber,
            },
          },
          card: {
            auditDeletedDateAt: Not(IsNull()),
          },
        },
        withDeleted: true,
        relations: {
          decision: {
            application: true,
          },
          card: service.CARD_RELATIONS,
        },
      });
      expect(result).toEqual(conditionCards);
    });
  });
});
