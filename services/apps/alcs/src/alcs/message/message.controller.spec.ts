import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { MessageProfile } from '../../common/automapper/message.automapper.profile';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let controller: MessageController;
  let notificationService: DeepMocked<MessageService>;

  beforeEach(async () => {
    notificationService = createMock<MessageService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [MessageController],
      providers: [
        MessageProfile,
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: MessageService,
          useValue: notificationService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should map createdAt to number for getAll', async () => {
    const date = new Date();
    notificationService.list.mockResolvedValue([
      {
        createdAt: date,
      } as Message,
    ]);

    const res = await controller.getMyNotifications({
      user: {
        entity: {
          uuid: 'fake-user',
        },
      },
    });

    expect(res.length).toEqual(1);
    expect(res[0].createdAt).toEqual(date.getTime());
    expect(notificationService.list).toHaveBeenCalledTimes(1);
    expect(notificationService.list.mock.calls[0][0]).toEqual('fake-user');
  });

  it('should default list to empty array when no user', async () => {
    notificationService.list.mockResolvedValue([]);

    const res = await controller.getMyNotifications({
      user: { entity: {} },
    });

    expect(res).toEqual([]);
    expect(notificationService.list).not.toHaveBeenCalled();
  });

  it('should call into service for markReadAll', async () => {
    notificationService.markAllRead.mockResolvedValue({} as any);

    await controller.markAllRead({
      user: {
        entity: {
          uuid: 'fake-user',
        },
      },
    });

    expect(notificationService.markAllRead).toHaveBeenCalledTimes(1);
    expect(notificationService.markAllRead.mock.calls[0][0]).toEqual(
      'fake-user',
    );
  });

  it('should call into service for markRead', async () => {
    notificationService.get.mockResolvedValue({} as Message);
    notificationService.markRead.mockResolvedValue({} as any);

    await controller.markRead(
      {
        user: {
          entity: {
            uuid: 'fake-user',
          },
        },
      },
      'fake-notification',
    );

    expect(notificationService.markRead).toHaveBeenCalledTimes(1);
    expect(notificationService.markRead.mock.calls[0][0]).toEqual(
      'fake-notification',
    );
  });

  it('should throw an exception when notification is not found', async () => {
    notificationService.get.mockResolvedValue(null);
    notificationService.markRead.mockResolvedValue({} as any);

    await expect(
      controller.markRead(
        {
          user: {
            entity: {
              uuid: 'fake-user',
            },
          },
        },
        'fake-notification',
      ),
    ).rejects.toMatchObject(new Error(`Failed to find message`));

    expect(notificationService.markRead).not.toHaveBeenCalled();
  });
});
