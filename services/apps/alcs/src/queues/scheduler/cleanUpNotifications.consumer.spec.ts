import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';
import { NotificationService } from '../../alcs/notification/notification.service';
import { CleanUpNotificationsConsumer } from './cleanUpNotifications.consumer';

describe('SchedulerConsumerService', () => {
  let notificationCleanUpConsumer: CleanUpNotificationsConsumer;
  let mockNotificationService: DeepMocked<NotificationService>;

  beforeEach(async () => {
    mockNotificationService = createMock<NotificationService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CleanUpNotificationsConsumer,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    notificationCleanUpConsumer = module.get<CleanUpNotificationsConsumer>(
      CleanUpNotificationsConsumer,
    );
  });

  it('should be defined', () => {
    expect(notificationCleanUpConsumer).toBeDefined();
  });

  it('should clean up both read and unread notifications', async () => {
    mockNotificationService.cleanUp.mockResolvedValue({
      affected: 1,
    } as DeleteResult);

    await notificationCleanUpConsumer.cleanUpNotifications();

    expect(mockNotificationService.cleanUp).toHaveBeenCalledTimes(2);

    //Check it cleans up unread
    expect(mockNotificationService.cleanUp.mock.calls[1][1]).toEqual(false);
  });
});
