import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initCardMockEntity } from '../../../test/mocks/mockEntities';
import { Application } from '../../application/application.entity';
import { ApplicationService } from '../../application/application.service';
import { CardSubtaskType } from './card-subtask-type/card-subtask-type.entity';
import { CardSubtask } from './card-subtask.entity';
import { CardSubtaskService } from './card-subtask.service';

describe('CardSubtaskService', () => {
  let cardSubtaskService: CardSubtaskService;
  let mockSubtaskRepo: DeepMocked<Repository<CardSubtask>>;
  let mockSubtaskTypeRepo: DeepMocked<Repository<CardSubtaskType>>;
  let applicationService: DeepMocked<ApplicationService>;
  const mockCard = initCardMockEntity();

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
    mockSubtaskRepo = createMock<Repository<CardSubtask>>();
    mockSubtaskTypeRepo = createMock<Repository<CardSubtaskType>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardSubtaskService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: getRepositoryToken(CardSubtask),
          useValue: mockSubtaskRepo,
        },
        {
          provide: getRepositoryToken(CardSubtaskType),
          useValue: mockSubtaskTypeRepo,
        },
      ],
    }).compile();

    cardSubtaskService = module.get<CardSubtaskService>(CardSubtaskService);
  });

  it('should be defined', () => {
    expect(cardSubtaskService).toBeDefined();
  });

  it('should call repos for create', async () => {
    const mockSubtask = {
      uuid: 'fake-uuid',
    } as CardSubtask;
    applicationService.get.mockResolvedValue({} as Application);
    mockSubtaskTypeRepo.findOne.mockResolvedValue({} as CardSubtaskType);
    mockSubtaskRepo.save.mockResolvedValue({} as any);
    mockSubtaskRepo.findOne.mockResolvedValue(mockSubtask);

    const res = await cardSubtaskService.create(mockCard, 'fake-type');

    expect(mockSubtaskTypeRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockSubtaskRepo.save).toHaveBeenCalledTimes(1);
    expect(mockSubtaskRepo.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockSubtask);
  });

  it('should throw an exception if type does not exist', async () => {
    applicationService.get.mockResolvedValue({} as Application);
    mockSubtaskTypeRepo.findOne.mockResolvedValue(null);

    await expect(
      cardSubtaskService.create(mockCard, 'fake-type'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Invalid subtask type fake-type`),
    );

    expect(mockSubtaskTypeRepo.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call save and set fields for update', async () => {
    mockSubtaskRepo.findOne.mockResolvedValue({} as CardSubtask);
    mockSubtaskRepo.findOneOrFail.mockResolvedValue({} as CardSubtask);
    mockSubtaskRepo.save.mockResolvedValue({} as CardSubtask);

    const fakeTime = 15612312512;
    const fakeAssignee = 'fake-assignee';
    await cardSubtaskService.update('fake-uuid', {
      assignee: fakeAssignee,
      completedAt: fakeTime,
    });

    expect(mockSubtaskRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockSubtaskRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockSubtaskRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to update a non-existing subtask', async () => {
    mockSubtaskRepo.findOne.mockResolvedValue(null);

    await expect(
      cardSubtaskService.update('fake-uuid', {
        assignee: '',
        completedAt: 1,
      }),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Failed to find task fake-uuid`),
    );

    expect(mockSubtaskRepo.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    const subtask = new CardSubtask();
    mockSubtaskRepo.remove.mockResolvedValue({} as any);
    mockSubtaskRepo.findOneOrFail.mockResolvedValue(subtask);

    await cardSubtaskService.delete('fake-uuid');

    expect(mockSubtaskRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockSubtaskRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockSubtaskRepo.remove.mock.calls[0][0]).toBe(subtask);
  });
});
