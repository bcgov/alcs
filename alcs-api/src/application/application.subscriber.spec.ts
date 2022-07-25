import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityManager, UpdateEvent } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationSubscriber } from './application.subscriber';
import { Application } from './application.entity';

describe('ApplicationSubscriber', () => {
  let applicationSubscriber: ApplicationSubscriber;
  let mockDataSource;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;
  let subscribersArray;

  let updateEvent: DeepMocked<UpdateEvent<Application>>;
  let oldApplication: DeepMocked<Application>;
  let newApplication: DeepMocked<Application>;
  let mockManager: DeepMocked<EntityManager>;

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

    mockUserService.getUser.mockResolvedValue({
      uuid: 'fake-uuid',
    } as User);
    updateEvent = createMock<UpdateEvent<Application>>();
    oldApplication = createMock<Application>();
    newApplication = createMock<Application>();
    mockManager = createMock<EntityManager>();

    mockDataSource.subscribers = subscribersArray;

    oldApplication.statusUuid = 'old-status';
    oldApplication.auditUpdatedAt = 10001;
    newApplication.statusUuid = 'new-status';

    updateEvent.databaseEntity = oldApplication;
    updateEvent.entity = newApplication;
    updateEvent.manager = mockManager;
    mockManager.save.mockResolvedValue({});

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

  it('should create a new history application when status is changed', async () => {
    const endDate = Date.now();

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
      auditCreatedAt: 10002,
    } as Application;

    await applicationSubscriber.beforeUpdate(updateEvent);

    expect(mockManager.save).toHaveBeenCalled();
    const savedValue = mockManager.save.mock
      .calls[0][0] as unknown as ApplicationHistory;
    expect(savedValue.startDate).toEqual(10002);
  });

  it('should not save anything if status is the same', async () => {
    oldApplication.statusUuid = 'same-status';
    newApplication.statusUuid = 'same-status';

    await applicationSubscriber.beforeUpdate(updateEvent);
    expect(mockManager.save).not.toHaveBeenCalled();
  });

  it('should throw an error if user is not found', async () => {
    mockUserService.getUser.mockResolvedValue(undefined);

    await expect(
      applicationSubscriber.beforeUpdate(updateEvent),
    ).rejects.toMatchObject(
      new Error(`User not found from token! Has their email changed?`),
    );
  });
});
