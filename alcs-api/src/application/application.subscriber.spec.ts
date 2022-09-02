import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityManager, UpdateEvent } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationPaused } from './application-paused.entity';
import { Application } from './application.entity';
import { ApplicationSubscriber } from './application.subscriber';

describe('ApplicationSubscriber', () => {
  let applicationSubscriber: ApplicationSubscriber;
  let mockDataSource;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;
  let subscribersArray;

  let updateEvent: DeepMocked<UpdateEvent<Application>>;
  let oldApplication: Application;
  let newApplication: Application;
  let mockManager: DeepMocked<EntityManager>;

  const oldStatus = 'old-status';
  const newStatus = 'new-status';

  beforeAll(() => {
    jest.useFakeTimers({
      now: new Date(),
    });
  });

  beforeEach(async () => {
    mockDataSource = createMock<DataSource>();
    mockClsService = createMock<ClsService>();
    mockUserService = createMock<UserService>();
    subscribersArray = [];

    mockUserService.get.mockResolvedValue({
      uuid: 'fake-uuid',
    } as User);
    updateEvent = createMock<UpdateEvent<Application>>();
    oldApplication = {} as Application;
    newApplication = {} as Application;
    mockManager = createMock<EntityManager>();

    mockDataSource.subscribers = subscribersArray;

    oldApplication.statusUuid = oldStatus;
    oldApplication.auditUpdatedAt = new Date(2, 2, 2, 2, 2, 2, 2);
    oldApplication.paused = false;
    newApplication.statusUuid = newStatus;
    newApplication.paused = false;

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
        ApplicationSubscriber,
      ],
    }).compile();

    applicationSubscriber = module.get<ApplicationSubscriber>(
      ApplicationSubscriber,
    );
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be add itself to subscribers', () => {
    expect(subscribersArray.length).toEqual(1);
  });

  it('should create return Application for listenTo', () => {
    expect(applicationSubscriber.listenTo()).toEqual(Application);
  });

  it('should throw an error if user is not found', async () => {
    mockUserService.get.mockResolvedValue(undefined);

    await expect(
      applicationSubscriber.beforeUpdate(updateEvent),
    ).rejects.toMatchObject(
      new Error(`User not found from token! Has their email changed?`),
    );
  });

  describe('ApplicationHistory', () => {
    it('should create a new history application when status is changed', async () => {
      const endDate = new Date(1, 1, 1, 1, 1, 1, 1);

      await applicationSubscriber.beforeUpdate(updateEvent);

      expect(mockManager.save).toHaveBeenCalled();
      const savedValue = mockManager.save.mock
        .calls[0][0] as unknown as ApplicationHistory;
      expect(savedValue.startDate).toEqual(oldApplication.auditUpdatedAt);
      expect(savedValue.endDate).toEqual(endDate);
      expect(savedValue.statusUuid).toEqual(oldApplication.statusUuid);
    });

    it('should fallback to createdAt if old entity has no updatedAt', async () => {
      updateEvent.databaseEntity = {
        auditUpdatedAt: null,
        auditCreatedAt: new Date(3, 3, 3, 3, 3, 3, 3),
      } as Application;

      await applicationSubscriber.beforeUpdate(updateEvent);

      expect(mockManager.save).toHaveBeenCalled();
      const savedValue = mockManager.save.mock
        .calls[0][0] as unknown as ApplicationHistory;
      expect(savedValue.startDate).toEqual(new Date(3, 3, 3, 3, 3, 3, 3));
    });

    it('should not save anything if status is the same', async () => {
      oldApplication.statusUuid = 'same-status';
      newApplication.statusUuid = 'same-status';

      await applicationSubscriber.beforeUpdate(updateEvent);
      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });

  describe('ApplicationPaused', () => {
    it('should create a new paused entity when paused is started', async () => {
      updateEvent.databaseEntity.paused = false;
      updateEvent.entity.paused = true;
      updateEvent.entity.statusUuid = oldStatus;

      await applicationSubscriber.beforeUpdate(updateEvent);

      expect(mockManager.save).toHaveBeenCalled();
      const savedValue = mockManager.save.mock
        .calls[0][0] as unknown as ApplicationPaused;
      expect(savedValue.application).toEqual(newApplication);
      expect(savedValue.auditCreatedBy).toEqual('fake-uuid');
    });
  });
});
