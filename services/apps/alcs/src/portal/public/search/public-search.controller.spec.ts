import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { Repository } from 'typeorm';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationType } from '../../../alcs/code/application-code/application-type/application-type.entity';
import { PublicApplicationSearchService } from './application/public-application-search.service';
import { PublicNoticeOfIntentSearchService } from './notice-of-intent/public-notice-of-intent-search.service';
import { PublicNotificationSearchService } from './notification/public-notification-search.service';
import { PublicSearchController } from './public-search.controller';
import { SearchRequestDto } from './public-search.dto';

describe('PublicSearchController', () => {
  let controller: PublicSearchController;
  let mockNOIPublicSearchService: DeepMocked<PublicNoticeOfIntentSearchService>;
  let mockAppPublicSearchService: DeepMocked<PublicApplicationSearchService>;
  let mockNotiPublicSearchService: DeepMocked<PublicNotificationSearchService>;
  let mockAppTypeRepo: DeepMocked<Repository<ApplicationType>>;

  beforeEach(async () => {
    mockNOIPublicSearchService = createMock();
    mockAppPublicSearchService = createMock();
    mockNotiPublicSearchService = createMock();
    mockAppTypeRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: PublicNoticeOfIntentSearchService,
          useValue: mockNOIPublicSearchService,
        },
        {
          provide: PublicApplicationSearchService,
          useValue: mockAppPublicSearchService,
        },
        {
          provide: PublicNotificationSearchService,
          useValue: mockNotiPublicSearchService,
        },
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: mockAppTypeRepo,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [PublicSearchController],
    }).compile();

    controller = module.get<PublicSearchController>(PublicSearchController);

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call search to retrieve Applications, NOIs, Notifications', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      name: 'test',
      fileTypes: [],
    };

    const result = await controller.search(mockSearchRequestDto);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(1);
    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should call applications advanced search to retrieve Applications', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: [],
    };

    const result = await controller.searchApplications(mockSearchRequestDto);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call NOI advanced search to retrieve NOIs', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: [],
    };

    const result = await controller.searchNoticeOfIntents(mockSearchRequestDto);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(1);
    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('should call search to retrieve Applications only when application file type selected', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NFUP'],
    };

    const result = await controller.search(mockSearchRequestDto);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);
  });

  it('should call search to retrieve NOIs only when NOI file type selected', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NOI'],
    };

    const result = await controller.search(mockSearchRequestDto);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(1);
    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });

  it('should NOT call NOI search to retrieve if file type app specified', async () => {
    const mockSearchRequestDto: SearchRequestDto = {
      pageSize: 1,
      page: 1,
      sortField: '1',
      sortDirection: 'ASC',
      fileTypes: ['NFUP'],
    };

    const result = await controller.search(mockSearchRequestDto);

    expect(mockAppPublicSearchService.searchApplications).toBeCalledTimes(1);
    expect(mockAppPublicSearchService.searchApplications).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(result.applications).toBeDefined();
    expect(result.totalApplications).toBe(0);

    expect(mockNOIPublicSearchService.searchNoticeOfIntents).toBeCalledTimes(0);
    expect(result.noticeOfIntents).toBeDefined();
    expect(result.totalNoticeOfIntents).toBe(0);
  });
});
