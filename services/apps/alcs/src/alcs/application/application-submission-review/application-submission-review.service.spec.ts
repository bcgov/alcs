import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationSubmissionReview } from '../../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

describe('ApplicationSubmissionReviewService', () => {
  let service: ApplicationSubmissionReviewService;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmissionReview>
  >;
  let mapper: DeepMocked<Mapper>;

  beforeEach(async () => {
    mockApplicationSubmissionRepository = createMock();
    mapper = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionReviewService,
        {
          provide: getRepositoryToken(ApplicationSubmissionReview),
          useValue: mockApplicationSubmissionRepository,
        },
        {
          provide: getMapperToken(),
          useValue: mapper,
        },
      ],
    }).compile();

    service = module.get<ApplicationSubmissionReviewService>(
      ApplicationSubmissionReviewService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully find ApplicationSubmission', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionRepository.findOneOrFail.mockResolvedValue(
      {} as ApplicationSubmissionReview,
    );

    const result = await service.get(fakeFileNumber);

    expect(result).toBeDefined();
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneOrFail).toBeCalledWith({
      where: { applicationFileNumber: fakeFileNumber },
    });
  });

  it('should properly map to dto', async () => {
    mapper.mapAsync.mockResolvedValue({} as any);

    const fakeSubmission = createMock<ApplicationSubmissionReview>();

    const result = await service.mapToDto(fakeSubmission);

    expect(mapper.mapAsync).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
