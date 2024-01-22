import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { Repository, UpdateResult } from 'typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let mockRepository: DeepMocked<Repository<Message>>;
  let mockmessage: Message;

  beforeEach(async () => {
    mockRepository = createMock<Repository<Message>>();

    mockmessage = new Message({
      createdAt: new Date(),
      targetType: 'application',
      uuid: 'fake-uuid',
      receiverUuid: 'receiver',
      body: 'body',
      link: 'link goes here',
      title: 'title goes here',
      read: false,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockRepository,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find when loading messages', async () => {
    mockRepository.find.mockResolvedValue([mockmessage]);

    const messages = await service.list('fake-user');
    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual(mockmessage);
  });

  it('should call update with correct uuid when marking read', async () => {
    mockRepository.update.mockResolvedValue({} as UpdateResult);

    await service.markRead(mockmessage.uuid);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update.mock.calls[0][0]).toEqual({
      uuid: mockmessage.uuid,
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
    mockRepository.findOne.mockResolvedValue({} as Message);

    await service.get('fake-uuid', 'fake-receiever');
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });
});
