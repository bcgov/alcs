import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/board.entity';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import {
  initBoardMockEntity,
  initCardMockEntity,
} from '../../test/mocks/mockEntities';
import { CardType } from './card-type/card-type.entity';
import { CardUpdateServiceDto } from './card.dto';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let cardRepositoryMock: DeepMocked<Repository<Card>>;
  let cardTypeRepositoryMock: DeepMocked<Repository<CardType>>;
  let mockCardEntity;

  beforeEach(async () => {
    cardRepositoryMock = createMock<Repository<Card>>();
    cardTypeRepositoryMock = createMock<Repository<CardType>>();
    mockCardEntity = initCardMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: cardRepositoryMock,
        },
        {
          provide: getRepositoryToken(CardType),
          useValue: cardTypeRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);

    cardRepositoryMock.findOne.mockResolvedValue(mockCardEntity);
    cardRepositoryMock.save.mockResolvedValue(mockCardEntity);
    cardTypeRepositoryMock = module.get(getRepositoryToken(CardType));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get card', async () => {
    expect(await service.get('fake')).toStrictEqual(mockCardEntity);
  });

  it('should call save when an Card is updated', async () => {
    const payload: Partial<CardUpdateServiceDto> = {
      assigneeUuid: mockCardEntity.assigneeUuid,
      statusCode: mockCardEntity.statusCode,
      boardUuid: mockCardEntity.boardUuid,
    };

    const result = await service.update(mockCardEntity.uuid, payload);
    expect(result).toStrictEqual(mockCardEntity);
    expect(cardRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardRepositoryMock.save).toHaveBeenCalledWith(mockCardEntity);
  });

  it('should fail update if card does not exist', async () => {
    const payload: Partial<CardUpdateServiceDto> = {
      assigneeUuid: mockCardEntity.assigneeUuid,
      statusCode: mockCardEntity.statusCode,
      boardUuid: mockCardEntity.boardUuid,
    };

    cardRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.update(mockCardEntity.uuid, payload),
    ).rejects.toMatchObject(
      new ServiceValidationException(
        `Card for with ${mockCardEntity.uuid} not found`,
      ),
    );
    expect(cardRepositoryMock.save).toBeCalledTimes(0);
  });

  it('should call save when card successfully create', async () => {
    const board = {
      ...initBoardMockEntity(),
      code: 'fake-board',
      statuses: [{ order: 0, status: { code: 'fake-status' } }],
    } as Board;

    cardTypeRepositoryMock.findOne.mockResolvedValue({
      code: 'fake-type',
    } as CardType);

    await service.create('fake-type', board);

    expect(cardRepositoryMock.save).toBeCalledTimes(1);
  });

  it('should fail on create if type does not exist', async () => {
    const fakeType = 'fake-type';
    const board = {
      ...initBoardMockEntity(),
      code: 'fake-board',
      statuses: [{ order: 0, status: { code: 'fake-status' } }],
    } as Board;

    cardTypeRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create(fakeType, board)).rejects.toMatchObject(
      new ServiceValidationException(
        `Provided type does not exist ${fakeType}`,
      ),
    );

    expect(cardRepositoryMock.save).toBeCalledTimes(0);
  });
});
