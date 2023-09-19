import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';
import { MessageService } from '../../alcs/message/message.service';
import { CleanUpNotificationsConsumer } from './cleanUpNotifications.consumer';

describe('SchedulerConsumerService', () => {
  let notificationCleanUpConsumer: CleanUpNotificationsConsumer;
  let mockNotificationService: DeepMocked<MessageService>;

  beforeEach(async () => {
    mockNotificationService = createMock<MessageService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CleanUpNotificationsConsumer,
        {
          provide: MessageService,
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

    await notificationCleanUpConsumer.process();

    expect(mockNotificationService.cleanUp).toHaveBeenCalledTimes(2);

    //Check it cleans up unread
    expect(mockNotificationService.cleanUp.mock.calls[1][1]).toEqual(false);
  });
});
