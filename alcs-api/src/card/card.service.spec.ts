import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/board.entity';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import {
  initBoardMockEntity,
  initCardMockEntity,
} from '../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { CardType } from './card-type/card-type.entity';
import { CardCreateDto, CardUpdateServiceDto } from './card.dto';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let cardRepositoryMock: MockType<Repository<Card>>;
  let cardTypeRepositoryMock: MockType<Repository<CardType>>;
  const mockCardEntity = initCardMockEntity();

  beforeEach(async () => {
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
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CardType),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);

    cardRepositoryMock = module.get(getRepositoryToken(Card));
    cardRepositoryMock.findOne.mockReturnValue(mockCardEntity);
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
      statusUuid: mockCardEntity.statusUuid,
      boardUuid: mockCardEntity.boardUuid,
    };

    const result = await service.update(mockCardEntity.uuid, payload);
    expect(result).toStrictEqual(mockCardEntity);
    expect(cardRepositoryMock.save).toHaveBeenCalled();
    expect(cardRepositoryMock.save).toHaveBeenCalledWith(mockCardEntity);
  });

  it('should fail update if card does not exist', async () => {
    const payload: Partial<CardUpdateServiceDto> = {
      assigneeUuid: mockCardEntity.assigneeUuid,
      statusUuid: mockCardEntity.statusUuid,
      boardUuid: mockCardEntity.boardUuid,
    };

    cardRepositoryMock.findOne.mockReturnValue(undefined);

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
      uuid: 'fake',
      code: 'fake-board',
      statuses: [{ order: 0, status: { code: 'fake-status', uuid: 'fake' } }],
    } as Board;

    cardTypeRepositoryMock.findOneOrFail.mockReturnValue({
      code: 'fake-type',
      uuid: 'fake',
    });

    await service.create('fake-type', board);

    expect(cardRepositoryMock.save).toBeCalledTimes(1);
  });

  it('should fail on create if type does not exist', async () => {
    const fakeType = 'fake-type';
    const board = {
      ...initBoardMockEntity(),
      uuid: 'fake',
      code: 'fake-board',
      statuses: [{ order: 0, status: { code: 'fake-status', uuid: 'fake' } }],
    } as Board;

    cardTypeRepositoryMock.findOneOrFail.mockReturnValue(undefined);

    await expect(service.create(fakeType, board)).rejects.toMatchObject(
      new ServiceValidationException(
        `Provided type does not exist ${fakeType}`,
      ),
    );

    expect(cardRepositoryMock.save).toBeCalledTimes(0);
  });
});
