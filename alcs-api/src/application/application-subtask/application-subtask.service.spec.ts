import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationSubtaskType } from './application-subtask-type.entity';
import { ApplicationSubtask } from './application-subtask.entity';
import { ApplicationSubtaskService } from './application-subtask.service';

describe('ApplicationStatusService', () => {
  let applicationSubtaskService: ApplicationSubtaskService;
  let mockSubtaskRepo: DeepMocked<Repository<ApplicationSubtask>>;
  let mockSubtaskTypeRepo: DeepMocked<Repository<ApplicationSubtaskType>>;
  let applicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
    mockSubtaskRepo = createMock<Repository<ApplicationSubtask>>();
    mockSubtaskTypeRepo = createMock<Repository<ApplicationSubtaskType>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubtaskService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: getRepositoryToken(ApplicationSubtask),
          useValue: mockSubtaskRepo,
        },
        {
          provide: getRepositoryToken(ApplicationSubtaskType),
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
    } as ApplicationSubtask;
    applicationService.get.mockResolvedValue({} as Application);
    mockSubtaskTypeRepo.findOne.mockResolvedValue({} as ApplicationSubtaskType);
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

  it('should throw an exception if application doesnt exist for create', async () => {
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
    mockSubtaskRepo.findOne.mockResolvedValue({} as ApplicationSubtask);
    mockSubtaskRepo.save.mockResolvedValue({} as ApplicationSubtask);

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

  it('should call through for list', async () => {
    mockSubtaskRepo.find.mockResolvedValue([] as any);

    await applicationSubtaskService.list('fake-file-number');

    expect(mockSubtaskRepo.find).toHaveBeenCalled();
  });
});
