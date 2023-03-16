import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { Repository, UpdateResult } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockRepository: DeepMocked<Repository<Notification>>;
  let fakeNotification: Notification;

  beforeEach(async () => {
    mockRepository = createMock<Repository<Notification>>();

    fakeNotification = {
      createdAt: new Date(),
      targetType: 'application',
      uuid: 'fake-uuid',
      receiverUuid: 'receiver',
      body: 'body',
      link: 'link goes here',
      title: 'title goes here',
      read: false,
    } as Notification;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find when loading notifications', async () => {
    mockRepository.find.mockResolvedValue([fakeNotification]);

    const notifications = await service.list('fake-user');
    expect(notifications.length).toEqual(1);
    expect(notifications[0]).toEqual(fakeNotification);
  });

  it('should call update with correct uuid when marking read', async () => {
    mockRepository.update.mockResolvedValue({} as UpdateResult);

    await service.markRead(fakeNotification.uuid);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update.mock.calls[0][0]).toEqual({
      uuid: fakeNotification.uuid,
    });
  });

  it('should call update when marking all read', async () => {
    const userId = 'fake-user';
    mockRepository.update.mockResolvedValue({} as UpdateResult);

    await service.markAllRead(userId);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update.mock.calls[0][0]).toEqual({
      receiverUuid: userId,
    });
  });

  it('should call delete when doing cleanup', async () => {
    mockRepository.delete.mockResolvedValue({} as UpdateResult);

    await service.cleanUp(new Date());
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should call findOne when doing get', async () => {
    mockRepository.findOne.mockResolvedValue({} as Notification);

    await service.get('fake-uuid', 'fake-receiever');
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });
});
