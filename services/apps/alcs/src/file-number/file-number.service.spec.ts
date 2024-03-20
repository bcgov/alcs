import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../alcs/application/application.entity';
import { NoticeOfIntent } from '../alcs/notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../alcs/planning-review/planning-review.entity';
import { FileNumberService } from './file-number.service';

describe('FileNumberService', () => {
  let service: FileNumberService;
  let mockAppRepo: DeepMocked<Repository<Application>>;
  let mockPlanningReviewRepo: DeepMocked<Repository<PlanningReview>>;
  let mockNOIRepo: DeepMocked<Repository<NoticeOfIntent>>;

  beforeEach(async () => {
    mockAppRepo = createMock();
    mockPlanningReviewRepo = createMock();
    mockNOIRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileNumberService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockAppRepo,
        },
        {
          provide: getRepositoryToken(PlanningReview),
          useValue: mockPlanningReviewRepo,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNOIRepo,
        },
      ],
    }).compile();

    service = module.get<FileNumberService>(FileNumberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check all three repos for existence', async () => {
    mockAppRepo.exists.mockResolvedValue(false);
    mockPlanningReviewRepo.exists.mockResolvedValue(false);
    mockNOIRepo.exists.mockResolvedValue(false);

    const res = await service.checkValidFileNumber('');

    expect(res).toEqual(true);
  });

  it('should throw an exception if application exists', async () => {
    mockAppRepo.exists.mockResolvedValue(true);
    mockPlanningReviewRepo.exists.mockResolvedValue(false);
    mockNOIRepo.exists.mockResolvedValue(false);

    const promise = service.checkValidFileNumber('5');
    await expect(promise).rejects.toMatchObject(
      new ServiceValidationException(
        `Application/Planning Review/NOI already exists with File ID 5`,
      ),
    );

    expect(mockAppRepo.exists).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewRepo.exists).toHaveBeenCalledTimes(1);
    expect(mockNOIRepo.exists).toHaveBeenCalledTimes(1);
  });

  it('should generate and return new fileNumber', async () => {
    mockAppRepo.findOne
      .mockResolvedValueOnce({} as Application)
      .mockResolvedValue(null);
    mockAppRepo.query.mockResolvedValue([{ nextval: '2512' }]);

    const result = await service.generateNextFileNumber();

    expect(mockAppRepo.query).toBeCalledTimes(1);
    expect(result).toEqual('2512');
  });
});
