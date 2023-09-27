import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../../alcs/application/application.entity';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { PublicApplicationSubmissionSearchView } from './application/public-application-search-view.entity';
import { PublicSearchService } from './public-search.service';
import { Notification } from '../../../alcs/notification/notification.entity';

describe('PublicSearchService', () => {
  let service: PublicSearchService;
  let mockApplicationRepository: DeepMocked<Repository<Application>>;
  let mockNoiRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockApplicationSubmissionSearchView: DeepMocked<
    Repository<PublicApplicationSubmissionSearchView>
  >;
  let mockLocalGovernment: DeepMocked<Repository<LocalGovernment>>;
  let mockNotificationRepository: DeepMocked<Repository<Notification>>;

  const fakeFileNumber = 'fake';

  beforeEach(async () => {
    mockApplicationRepository = createMock();
    mockNoiRepository = createMock();
    mockApplicationSubmissionSearchView = createMock();
    mockLocalGovernment = createMock();
    mockNotificationRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicSearchService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNoiRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(PublicApplicationSubmissionSearchView),
          useValue: mockApplicationSubmissionSearchView,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernment,
        },
      ],
    }).compile();

    service = module.get<PublicSearchService>(PublicSearchService);
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
        localGovernment: true,
        type: true,
      },
    });
    expect(result).toBeDefined();
  });

  it('should call repository to get notification', async () => {
    mockNotificationRepository.findOne.mockResolvedValue(new Notification());

    const result = await service.getNotification('fake');

    expect(mockNotificationRepository.findOne).toBeCalledTimes(1);
    expect(mockNotificationRepository.findOne).toBeCalledWith({
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
