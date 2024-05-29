import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { Repository } from 'typeorm';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentType } from '../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NotificationSubmissionStatusService } from '../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { NotificationType } from '../../alcs/notification/notification-type/notification-type.entity';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { InboxApplicationService } from './application/inbox-application.service';
import { InboxController } from './inbox.controller';
import { InboxRequestDto } from './inbox.dto';
import { InboxNoticeOfIntentService } from './notice-of-intent/inbox-notice-of-intent.service';
import { InboxNotificationService } from './notification/inbox-notification.service';

describe('InboxController', () => {
  let controller: InboxController;
  let mockNOIPublicSearchService: DeepMocked<InboxNoticeOfIntentService>;
  let mockAppPublicSearchService: DeepMocked<InboxApplicationService>;
  let mockNotiPublicSearchService: DeepMocked<InboxNotificationService>;
  let mockAppSubStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockNoiSubStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;
  let mockNotiSubStatusService: DeepMocked<NotificationSubmissionStatusService>;
  let mockUserService: DeepMocked<UserService>;
  let mockAppTypeRepo: DeepMocked<Repository<ApplicationType>>;
  let mockNOITypeRepo: DeepMocked<Repository<NoticeOfIntentType>>;
  let mockNotificationTypeRepo: DeepMocked<Repository<NotificationType>>;

  let mockRequest;
  let mockSearchRequest;
  const mockUserId = 'fake-user-uuid';

  beforeEach(async () => {
    mockNOIPublicSearchService = createMock();
    mockAppPublicSearchService = createMock();
    mockNotiPublicSearchService = createMock();
    mockAppSubStatusService = createMock();
    mockNoiSubStatusService = createMock();
    mockNotiSubStatusService = createMock();
    mockUserService = createMock();
    mockAppTypeRepo = createMock();
    mockNOITypeRepo = createMock();
    mockNotificationTypeRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: InboxNoticeOfIntentService,
          useValue: mockNOIPublicSearchService,
        },
        {
          provide: InboxApplicationService,
          useValue: mockAppPublicSearchService,
        },
        {
          provide: InboxNotificationService,
          useValue: mockNotiPublicSearchService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockAppSubStatusService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoiSubStatusService,
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockNotiSubStatusService,
        },
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: mockAppTypeRepo,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentType),
          useValue: mockNOITypeRepo,
        },
        {
          provide: getRepositoryToken(NotificationType),
          useValue: mockNotificationTypeRepo,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      controllers: [InboxController],
    }).compile();

    controller = module.get<InboxController>(InboxController);

    mockUserService.getUserLocalGovernment.mockResolvedValue(null);

    mockNOIPublicSearchService.searchNoticeOfIntents.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockAppPublicSearchService.searchApplications.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockNotiPublicSearchService.search.mockResolvedValue({
      data: [],
      total: 0,
    });

    mockRequest = {
      user: {
        entity: new User({
          uuid: mockUserId,
          bceidBusinessGuid: null,
        }),
      },
    };

    mockSearchRequest = {
      pageSize: 1,
      page: 1,
      fileTypes: [],
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call search to retrieve Applications, NOIs, Notifications', async () => {
    const mockSearchRequestDto: InboxRequestDto = {
      name: 'test',
      ...mockSearchRequest,
    };

    const result = await controller.search(mockSearchRequestDto, mockRequest);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
      mockUserId,
      null,
      null,
    );
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(1);
    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledWith(
      mockSearchRequestDto,
      mockUserId,
      null,
      null,
    );
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should call applications advanced search to retrieve Applications', async () => {
    const result = await controller.searchApplications(
      mockSearchRequest,
      mockRequest,
    );

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequest,
      mockUserId,
      null,
      null,
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call NOI advanced search to retrieve NOIs', async () => {
    const result = await controller.searchNoticeOfIntents(
      mockSearchRequest,
      mockRequest,
    );

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(1);
    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledWith(
      mockSearchRequest,
      mockUserId,
      null,
      null,
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call search to retrieve Applications only when application file type selected', async () => {
    const mockSearchRequestDto: InboxRequestDto = {
      ...mockSearchRequest,
      fileTypes: ['NFUP'],
    };

    const result = await controller.search(mockSearchRequestDto, mockRequest);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
      mockUserId,
      null,
      null,
    );
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);
  });

  it('should call search to retrieve NOIs only when NOI file type selected', async () => {
    const mockSearchRequestDto: InboxRequestDto = {
      ...mockSearchRequest,
      fileTypes: ['NOI'],
    };

    const result = await controller.search(mockSearchRequestDto, mockRequest);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(1);
    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledWith(
      mockSearchRequestDto,
      mockUserId,
      null,
      null,
    );
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should NOT call NOI search to retrieve if file type app specified', async () => {
    const mockSearchRequestDto: InboxRequestDto = {
      ...mockSearchRequest,
      fileTypes: ['NFUP'],
    };

    const result = await controller.search(mockSearchRequestDto, mockRequest);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
      mockUserId,
      null,
      null,
    );
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(0);
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });
});
