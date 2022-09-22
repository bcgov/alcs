import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { CardSubtaskType } from './application-subtask-type.entity';
import { CardSubtask } from './application-subtask.entity';
import { ApplicationSubtaskService } from './application-subtask.service';

describe('ApplicationSubtaskService', () => {
  let applicationSubtaskService: ApplicationSubtaskService;
  let mockSubtaskRepo: DeepMocked<Repository<CardSubtask>>;
  let mockSubtaskTypeRepo: DeepMocked<Repository<CardSubtaskType>>;
  let applicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
    mockSubtaskRepo = createMock<Repository<CardSubtask>>();
    mockSubtaskTypeRepo = createMock<Repository<CardSubtaskType>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubtaskService,
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

    applicationSubtaskService = module.get<ApplicationSubtaskService>(
      ApplicationSubtaskService,
    );
  });

  it('should be defined', () => {
    expect(applicationSubtaskService).toBeDefined();
  });

  it('should check application exists and call through to repos for create', async () => {
    const mockSubtask = {
      uuid: 'fake-uuid',
    } as CardSubtask;
    applicationService.get.mockResolvedValue({} as Application);
    mockSubtaskTypeRepo.findOne.mockResolvedValue({} as CardSubtaskType);
    mockSubtaskRepo.save.mockResolvedValue({} as any);
    mockSubtaskRepo.findOne.mockResolvedValue(mockSubtask);

    const res = await applicationSubtaskService.create(
      'mock-file',
      'fake-type',
    );

    expect(applicationService.get).toHaveBeenCalled();
    expect(mockSubtaskTypeRepo.findOne).toHaveBeenCalled();
    expect(mockSubtaskRepo.save).toHaveBeenCalled();
    expect(mockSubtaskRepo.findOne).toHaveBeenCalled();
    expect(res).toEqual(mockSubtask);
  });

  it("should throw an exception if application doesn't exist for create", async () => {
    applicationService.get.mockResolvedValue(undefined);

    await expect(
      applicationSubtaskService.create('mock-file', 'fake-type'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`File number not found mock-file`),
    );

    expect(applicationService.get).toHaveBeenCalled();
  });

  it('should throw an exception if type does not exist', async () => {
    applicationService.get.mockResolvedValue({} as Application);
    mockSubtaskTypeRepo.findOne.mockResolvedValue(undefined);

    await expect(
      applicationSubtaskService.create('mock-file', 'fake-type'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Invalid subtask type fake-type`),
    );

    expect(applicationService.get).toHaveBeenCalled();
    expect(mockSubtaskTypeRepo.findOne).toHaveBeenCalled();
  });

  it('should call save and set fields for update', async () => {
    mockSubtaskRepo.findOne.mockResolvedValue({} as CardSubtask);
    mockSubtaskRepo.save.mockResolvedValue({} as CardSubtask);

    const fakeTime = 15612312512;
    const fakeAssignee = 'fake-assignee';
    const res = await applicationSubtaskService.update('fake-uuid', {
      assignee: fakeAssignee,
      completedAt: fakeTime,
    });

    expect(mockSubtaskRepo.findOne).toHaveBeenCalled();
    expect(mockSubtaskRepo.save).toHaveBeenCalled();
    expect(res.completedAt).toEqual(new Date(fakeTime));
    expect(res.assigneeUuid).toEqual(fakeAssignee);
  });

  it('should throw an exception when trying to update a non-existing subtask', async () => {
    mockSubtaskRepo.findOne.mockResolvedValue(undefined);

    await expect(
      applicationSubtaskService.update('fake-uuid', {
        assignee: '',
        completedAt: 1,
      }),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Failed to find task fake-uuid`),
    );

    expect(mockSubtaskRepo.findOne).toHaveBeenCalled();
  });

  it('should call through for delete', async () => {
    mockSubtaskRepo.delete.mockResolvedValue({} as any);

    await applicationSubtaskService.delete('fake-uuid');

    expect(mockSubtaskRepo.delete).toHaveBeenCalled();
    expect(mockSubtaskRepo.delete.mock.calls[0][0]).toEqual('fake-uuid');
  });
});
