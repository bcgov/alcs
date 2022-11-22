import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationPausedService } from './application-paused.service';

describe('ApplicationPausedService', () => {
  let service: ApplicationPausedService;
  let mockRepository: DeepMocked<Repository<ApplicationPaused>>;

  beforeEach(async () => {
    mockRepository = createMock<Repository<ApplicationPaused>>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationPausedService,
        {
          provide: getRepositoryToken(ApplicationPaused),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationPausedService>(ApplicationPausedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through for get', async () => {
    const mockPause = {} as ApplicationPaused;
    mockRepository.findOne.mockResolvedValue(mockPause);

    const res = await service.get('uuid');

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(mockPause);
  });

  it('should call through for remove', async () => {
    mockRepository.delete.mockResolvedValue({} as any);

    await service.remove('uuid');

    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should call save in the create happy path', async () => {
    const mockPause = {} as ApplicationPaused;
    mockRepository.save.mockResolvedValue(mockPause);

    const res = await service.createOrUpdate({
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(res).toBe(mockPause);
  });

  it('should throw an exception if the given uuid is not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const res = service.createOrUpdate({
      startDate: new Date(),
      endDate: new Date(),
      uuid: 'invalid-uuid',
    });

    await expect(res).rejects.toMatchObject(
      new ServiceNotFoundException(`Pause not found invalid-uuid`),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an exception if start date is newer than end date', async () => {
    const mockPause = {} as ApplicationPaused;
    mockRepository.findOne.mockResolvedValue(mockPause);
    mockRepository.save.mockResolvedValue(mockPause);

    const res = service.createOrUpdate({
      startDate: new Date(5),
      endDate: new Date(0),
      uuid: 'invalid-uuid',
    });

    await expect(res).rejects.toMatchObject(
      new ServiceValidationException(
        `Start Date must be smaller(earlier) than End Date`,
      ),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
