import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { Covenant } from '../covenant/covenant.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationSubmissionSearchView } from './search.entity';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let mockApplicationRepository: DeepMocked<Repository<Application>>;
  let mockNoiRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockPlanningReviewRepository: DeepMocked<Repository<PlanningReview>>;
  let mockCovenantRepository: DeepMocked<Repository<Covenant>>;
  let mockApplicationSubmissionSearchView: DeepMocked<
    Repository<ApplicationSubmissionSearchView>
  >;
  let mockLocalGovernment: DeepMocked<Repository<LocalGovernment>>;

  const fakeFileNumber = 'fake';

  beforeEach(async () => {
    mockApplicationRepository = createMock();
    mockNoiRepository = createMock();
    mockPlanningReviewRepository = createMock();
    mockCovenantRepository = createMock();
    mockApplicationSubmissionSearchView = createMock();
    mockLocalGovernment = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNoiRepository,
        },
        {
          provide: getRepositoryToken(PlanningReview),
          useValue: mockPlanningReviewRepository,
        },
        {
          provide: getRepositoryToken(Covenant),
          useValue: mockCovenantRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmissionSearchView),
          useValue: mockApplicationSubmissionSearchView,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernment,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository to get notice of intent', async () => {
    mockNoiRepository.findOne.mockResolvedValue(new NoticeOfIntent());

    const result = await service.getNoi('fake');

    expect(mockNoiRepository.findOne).toBeCalledTimes(1);
    expect(mockNoiRepository.findOne).toBeCalledWith({
      where: {
        fileNumber: fakeFileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
      },
    });
    expect(result).toBeDefined();
  });

  it('should call repository to get application', async () => {
    mockApplicationRepository.findOne.mockResolvedValue(new Application());

    const result = await service.getApplication('fake');

    expect(mockApplicationRepository.findOne).toBeCalledTimes(1);
    expect(mockApplicationRepository.findOne).toBeCalledWith({
      where: {
        fileNumber: fakeFileNumber,
      },
      relations: {
        card: true,
        localGovernment: true,
        type: true,
      },
    });
    expect(result).toBeDefined();
  });

  it('should call repository to get planning review', async () => {
    mockPlanningReviewRepository.findOne.mockResolvedValue(
      new PlanningReview(),
    );

    const result = await service.getPlanningReview('fake');

    expect(mockPlanningReviewRepository.findOne).toBeCalledTimes(1);
    expect(mockPlanningReviewRepository.findOne).toBeCalledWith({
      where: {
        fileNumber: fakeFileNumber,
        card: { archived: false },
      },
      relations: {
        card: {
          board: true,
        },
        localGovernment: true,
      },
    });
    expect(result).toBeDefined();
  });

  it('should call repository to get covenant', async () => {
    mockCovenantRepository.findOne.mockResolvedValue(new Covenant());

    const result = await service.getCovenant('fake');

    expect(mockCovenantRepository.findOne).toBeCalledTimes(1);
    expect(mockCovenantRepository.findOne).toBeCalledWith({
      where: {
        fileNumber: fakeFileNumber,
        card: { archived: false },
      },
      relations: {
        card: {
          board: true,
        },
        localGovernment: true,
      },
    });
    expect(result).toBeDefined();
  });
});
