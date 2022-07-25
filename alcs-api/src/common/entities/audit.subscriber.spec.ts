import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityManager, UpdateEvent } from 'typeorm';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { Base } from './base.entity';
import { SYSTEM_ID, AuditSubscriber } from './audit.subscriber';

describe('AuditSubscriber', () => {
  let updatedBySubscriber: AuditSubscriber;
  let mockDataSource;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;
  let subscribersArray;

  let updateEvent: DeepMocked<UpdateEvent<any>>;
  let mockEntity: Partial<Base>;
  let mockManager: DeepMocked<EntityManager>;

  const fakeUserId = 'fake-uuid';

  beforeEach(async () => {
    mockDataSource = createMock<DataSource>();
    mockClsService = createMock<ClsService>();
    mockUserService = createMock<UserService>();
    subscribersArray = [];

    mockUserService.getUser.mockResolvedValue({
      uuid: fakeUserId,
    } as User);
    updateEvent = createMock<UpdateEvent<any>>();
    mockEntity = {
      auditUpdatedBy: null,
      auditCreatedBy: SYSTEM_ID,
    };

    mockManager = createMock<EntityManager>();

    mockDataSource.subscribers = subscribersArray;

    updateEvent.entity = mockEntity;
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
        AuditSubscriber,
      ],
    }).compile();

    updatedBySubscriber = module.get<AuditSubscriber>(AuditSubscriber);
  });

  it('should be add itself to subscribers', () => {
    expect(subscribersArray.length).toEqual(1);
  });

  describe('beforeInsert', () => {
    it('should set the created by for a valid change', async () => {
      await updatedBySubscriber.beforeInsert({
        entity: mockEntity,
      } as UpdateEvent<any>);

      expect(mockEntity.auditCreatedBy).toEqual(fakeUserId);
    });

    it('should throw an error if user is not found in beforeUpdate', async () => {
      mockUserService.getUser.mockResolvedValue(undefined);

      await expect(
        updatedBySubscriber.beforeInsert(updateEvent),
      ).rejects.toMatchObject(
        new Error(`User not found from token! Has their email changed?`),
      );
    });

    it('should fallback to the system id when a user is not present', async () => {
      mockClsService.get.mockReturnValue(undefined);

      await updatedBySubscriber.beforeInsert({
        entity: mockEntity,
      } as UpdateEvent<any>);

      expect(mockEntity.auditCreatedBy).toEqual(SYSTEM_ID);
    });
  });

  describe('beforeUpdate', () => {
    it('should set the updated by for a valid change', async () => {
      await updatedBySubscriber.beforeUpdate({
        entity: mockEntity,
      } as UpdateEvent<any>);

      expect(mockEntity.auditUpdatedBy).toEqual(fakeUserId);
    });

    it('should throw an error if user is not found in beforeUpdate', async () => {
      mockUserService.getUser.mockResolvedValue(undefined);

      await expect(
        updatedBySubscriber.beforeUpdate(updateEvent),
      ).rejects.toMatchObject(
        new Error(`User not found from token! Has their email changed?`),
      );
    });

    it('should fallback to the system id when a user is not present', async () => {
      mockClsService.get.mockReturnValue(undefined);

      await updatedBySubscriber.beforeUpdate({
        entity: mockEntity,
      } as UpdateEvent<any>);

      expect(mockEntity.auditCreatedBy).toEqual(SYSTEM_ID);
    });
  });
});
