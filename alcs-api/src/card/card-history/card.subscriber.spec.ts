import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityManager, UpdateEvent } from 'typeorm';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { Card } from '../card.entity';
import { CardHistory } from './card-history.entity';
import { CardSubscriber } from './card.subscriber';

describe('CardSubscriber', () => {
  let cardSubscriber: CardSubscriber;
  let mockDataSource;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;
  let subscribersArray;

  let updateEvent: DeepMocked<UpdateEvent<Card>>;
  let oldApplication: Card;
  let newApplication: Card;
  let mockManager: DeepMocked<EntityManager>;

  const oldStatus = 'old-status';
  const newStatus = 'new-status';

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
  });

  beforeEach(async () => {
    mockDataSource = createMock<DataSource>();
    mockClsService = createMock<ClsService>();
    mockUserService = createMock<UserService>();
    subscribersArray = [];

    mockUserService.get.mockResolvedValue({
      uuid: 'fake-uuid',
    } as User);
    updateEvent = createMock<UpdateEvent<Card>>();
    oldApplication = {} as Card;
    newApplication = {} as Card;
    mockManager = createMock<EntityManager>();

    mockDataSource.subscribers = subscribersArray;

    oldApplication.statusCode = oldStatus;
    oldApplication.auditUpdatedAt = new Date(2, 2, 2, 2, 2, 2, 2);
    newApplication.statusCode = newStatus;

    updateEvent.databaseEntity = oldApplication;
    updateEvent.entity = newApplication;
    updateEvent.manager = mockManager;
    mockManager.save.mockResolvedValue({});
    mockManager.update.mockResolvedValue({} as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        CardSubscriber,
      ],
    }).compile();

    cardSubscriber = module.get<CardSubscriber>(CardSubscriber);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be add itself to subscribers', () => {
    expect(subscribersArray.length).toEqual(1);
  });

  it('should create return Card for listenTo', () => {
    expect(cardSubscriber.listenTo()).toEqual(Card);
  });

  it('should throw an error if user is not found', async () => {
    mockUserService.get.mockResolvedValue(undefined);

    await expect(
      cardSubscriber.beforeUpdate(updateEvent),
    ).rejects.toMatchObject(
      new Error(`User not found from token! Has their email changed?`),
    );
  });

  describe('CardHistory', () => {
    it('should create a new history card when status is changed', async () => {
      const endDate = new Date();

      await cardSubscriber.beforeUpdate(updateEvent);

      expect(mockManager.save).toHaveBeenCalledTimes(1);
      const savedValue = mockManager.save.mock
        .calls[0][0] as unknown as CardHistory;
      expect(savedValue.startDate).toEqual(oldApplication.auditUpdatedAt);
      expect(savedValue.endDate).toEqual(endDate);
      expect(savedValue.statusCode).toEqual(oldApplication.statusCode);
    });

    it('should fallback to createdAt if old entity has no updatedAt', async () => {
      updateEvent.databaseEntity = {
        auditUpdatedAt: null,
        auditCreatedAt: new Date(3, 3, 3, 3, 3, 3, 3),
      } as Card;

      await cardSubscriber.beforeUpdate(updateEvent);

      expect(mockManager.save).toHaveBeenCalledTimes(1);
      const savedValue = mockManager.save.mock
        .calls[0][0] as unknown as CardHistory;
      expect(savedValue.startDate).toEqual(new Date(3, 3, 3, 3, 3, 3, 3));
    });

    it('should not save anything if status is the same', async () => {
      oldApplication.statusCode = 'same-status';
      newApplication.statusCode = 'same-status';

      await cardSubscriber.beforeUpdate(updateEvent);
      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });
});
