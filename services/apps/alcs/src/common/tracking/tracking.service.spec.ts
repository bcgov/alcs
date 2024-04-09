import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { FileViewed } from './file-viewed.entity';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  let mockRepo: DeepMocked<Repository<FileViewed>>;

  beforeEach(async () => {
    mockRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: getRepositoryToken(FileViewed),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should insert a record for trackView', async () => {
    mockRepo.insert.mockResolvedValue({} as any);

    await service.trackView(new User(), 'fileNumber');

    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
    expect(mockRepo.insert.mock.calls[0][0]['fileNumber']).toEqual(
      'fileNumber',
    );
  });
});
