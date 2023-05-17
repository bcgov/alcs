import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { getConfigToken } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { Repository } from 'typeorm';
import {
  initBoardMockEntity,
  initCardMockEntity,
} from '../../../test/mocks/mockEntities';
import { User } from '../../user/user.entity';
import { Board } from '../board/board.entity';
import { NotificationService } from '../notification/notification.service';
import { CardSubtaskService } from './card-subtask/card-subtask.service';
import { CardType } from './card-type/card-type.entity';
import { CardUpdateServiceDto } from './card.dto';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let cardRepositoryMock: DeepMocked<Repository<Card>>;
  let cardTypeRepositoryMock: DeepMocked<Repository<CardType>>;
  let mockCardEntity;
  let mockSubtaskService: DeepMocked<CardSubtaskService>;
  let mockNotificationService: DeepMocked<NotificationService>;

  beforeEach(async () => {
    cardRepositoryMock = createMock<Repository<Card>>();
    cardTypeRepositoryMock = createMock<Repository<CardType>>();
    mockCardEntity = initCardMockEntity();
    mockSubtaskService = createMock();
    mockNotificationService = createMock();

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
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: CardSubtaskService,
          useValue: mockSubtaskService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
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

    const result = await service.update(
      new User(),
      mockCardEntity.uuid,
      payload,
    );
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
      service.update(new User(), mockCardEntity.uuid, payload),
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

  it('should call the repo for listing types', async () => {
    cardTypeRepositoryMock.find.mockResolvedValue([new CardType({})]);

    const types = await service.getCardTypes();
    expect(types.length).toEqual(1);

    expect(cardTypeRepositoryMock.find).toBeCalledTimes(1);
  });

  it('should call the repo for getWithBoard', async () => {
    cardRepositoryMock.findOne.mockResolvedValue(new Card());

    const card = await service.getWithBoard('');
    expect(card).toBeDefined();
    expect(cardRepositoryMock.findOne).toBeCalledTimes(1);
  });

  it('should call notification service when assignee is changed', async () => {
    const mockUserUuid = 'fake-user';
    const mockUpdate = {
      assigneeUuid: mockUserUuid,
    };

    const fakeAuthor = new User({
      uuid: 'fake-author',
    });

    await service.update(fakeAuthor, 'fake', mockUpdate, 'Notification Text');

    expect(mockNotificationService.saveNotification).toHaveBeenCalledTimes(1);

    const createNotificationServiceDto =
      mockNotificationService.saveNotification.mock.calls[0][0];
    expect(createNotificationServiceDto.actor).toStrictEqual(fakeAuthor);
    expect(createNotificationServiceDto.receiverUuid).toStrictEqual(
      mockUserUuid,
    );
    expect(createNotificationServiceDto.title).toStrictEqual(
      "You've been assigned",
    );
    expect(createNotificationServiceDto.targetType).toStrictEqual('card');
  });
});
