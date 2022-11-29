import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let mockRepository: DeepMocked<Repository<Application>>;
  let mockStatusRepository: DeepMocked<Repository<ApplicationStatus>>;

  beforeEach(async () => {
    mockRepository = createMock();
    mockStatusRepository = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ApplicationStatus),
          useValue: mockStatusRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched application', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const app = await service.getOrFail('');
    expect(app).toBe(application);
  });

  it("should throw an error if application doesn't exist", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getOrFail('');
    await expect(promise).rejects.toMatchObject(
      new Error('Failed to find document'),
    );
  });

  it('save a new application for create', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    mockStatusRepository.findOne.mockResolvedValue(new ApplicationStatus());
    mockRepository.save.mockResolvedValue(new Application());

    const fileNumber = await service.create(new User());

    expect(fileNumber).toBeTruthy();
    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by user', async () => {
    const application = new Application();
    mockRepository.find.mockResolvedValue([application]);

    const res = await service.getByUser(new User());
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(application);
  });

  it('should call through for getByFileId', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getByFileId('', new User());
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });
});
