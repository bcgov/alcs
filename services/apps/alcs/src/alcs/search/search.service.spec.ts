import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { Inquiry } from '../inquiry/inquiry.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let mockApplicationRepository: DeepMocked<Repository<Application>>;
  let mockNoiRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockPlanningReviewRepository: DeepMocked<Repository<PlanningReview>>;
  let mockApplicationSubmissionSearchView: DeepMocked<
    Repository<ApplicationSubmissionSearchView>
  >;
  let mockLocalGovernment: DeepMocked<Repository<LocalGovernment>>;
  let mockNotificationRepository: DeepMocked<Repository<Notification>>;
  let mockInquiryRepository: DeepMocked<Repository<Inquiry>>;

  const fakeFileNumber = 'fake';

  beforeEach(async () => {
    mockApplicationRepository = createMock();
    mockNoiRepository = createMock();
    mockPlanningReviewRepository = createMock();
    mockApplicationSubmissionSearchView = createMock();
    mockLocalGovernment = createMock();
    mockNotificationRepository = createMock();
    mockInquiryRepository = createMock();

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
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmissionSearchView),
          useValue: mockApplicationSubmissionSearchView,
        },
        {
          provide: getRepositoryToken(Inquiry),
          useValue: mockInquiryRepository,
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

    expect(mockNoiRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockNoiRepository.findOne).toHaveBeenCalledWith({
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

    expect(mockApplicationRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
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

    expect(mockPlanningReviewRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewRepository.findOne).toHaveBeenCalledWith({
      where: {
        fileNumber: fakeFileNumber,
      },
      relations: {
        localGovernment: true,
      },
    });
    expect(result).toBeDefined();
  });

  it('should call repository to get notification', async () => {
    mockNotificationRepository.findOne.mockResolvedValue(new Notification());

    const result = await service.getNotification('fake');

    expect(mockNotificationRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
      where: {
        fileNumber: fakeFileNumber,
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

  it('should call repository to get application', async () => {
    mockInquiryRepository.findOne.mockResolvedValue(new Inquiry());

    const result = await service.getInquiry('fake');

    expect(mockInquiryRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockInquiryRepository.findOne).toHaveBeenCalledWith({
      where: {
        fileNumber: fakeFileNumber,
      },
      relations: {
        localGovernment: true,
      },
    });
    expect(result).toBeDefined();
  });
});
