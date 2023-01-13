import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { ApplicationReview } from './application-review.entity';
import { ApplicationReviewService } from './application-review.service';

describe('ApplicationReviewService', () => {
  let service: ApplicationReviewService;
  let mockRepository: DeepMocked<Repository<ApplicationReview>>;

  const mockLocalGovernment = {
    uuid: '',
    name: '',
    isFirstNation: false,
  };

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ApplicationReview),
          useValue: mockRepository,
        },
        ApplicationReviewService,
      ],
    }).compile();

    service = module.get<ApplicationReviewService>(ApplicationReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through for get', async () => {
    const appReview = new ApplicationReview();
    mockRepository.findOneOrFail.mockResolvedValue(appReview);

    const res = await service.get('', mockLocalGovernment);

    expect(res).toBe(appReview);
  });

  it('should call save for startReview', async () => {
    const appReview = new ApplicationReview();
    mockRepository.save.mockResolvedValue(appReview);

    const res = await service.startReview(new Application());

    expect(res).toBe(appReview);
  });

  it('should call save for update', async () => {
    const appReview = new ApplicationReview();
    mockRepository.findOneOrFail.mockResolvedValue(appReview);
    mockRepository.save.mockResolvedValue({} as any);

    const res = await service.update('', mockLocalGovernment, {});

    expect(res).toBeDefined();
  });
});
