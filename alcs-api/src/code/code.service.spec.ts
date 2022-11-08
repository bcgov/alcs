import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationReconsiderationType } from '../decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CardStatus } from '../card/card-status/card-status.entity';
import { ApplicationMeetingType } from './application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegion } from './application-code/application-region/application-region.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { CodeService } from './code.service';

describe('CodeService', () => {
  let mockTypeRepository: DeepMocked<Repository<ApplicationType>>;
  let mockStatusRepository: DeepMocked<Repository<CardStatus>>;
  let mockRegionRepository: DeepMocked<Repository<ApplicationRegion>>;
  let mockMeetingRepository: DeepMocked<Repository<ApplicationMeetingType>>;
  let mockReconsiderationTypeRepository: DeepMocked<
    Repository<ApplicationReconsiderationType>
  >;

  let service: CodeService;

  beforeEach(async () => {
    mockTypeRepository = createMock<Repository<ApplicationType>>();
    mockStatusRepository = createMock<Repository<CardStatus>>();
    mockRegionRepository = createMock<Repository<ApplicationRegion>>();
    mockMeetingRepository = createMock<Repository<ApplicationMeetingType>>();
    mockReconsiderationTypeRepository =
      createMock<Repository<ApplicationReconsiderationType>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeService,
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: mockTypeRepository,
        },
        {
          provide: getRepositoryToken(CardStatus),
          useValue: mockStatusRepository,
        },
        {
          provide: getRepositoryToken(ApplicationRegion),
          useValue: mockRegionRepository,
        },
        {
          provide: getRepositoryToken(ApplicationMeetingType),
          useValue: mockMeetingRepository,
        },
        {
          provide: getRepositoryToken(ApplicationReconsiderationType),
          useValue: mockReconsiderationTypeRepository,
        },
      ],
    }).compile();

    service = module.get<CodeService>(CodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call all repositories when fetching call', async () => {
    mockTypeRepository.find.mockResolvedValue([]);
    mockStatusRepository.find.mockResolvedValue([]);
    mockRegionRepository.find.mockResolvedValue([]);
    mockMeetingRepository.find.mockResolvedValue([]);
    mockReconsiderationTypeRepository.find.mockResolvedValue([]);

    await service.getAll();

    expect(mockTypeRepository.find).toHaveBeenCalledTimes(1);
    expect(mockStatusRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRegionRepository.find).toHaveBeenCalledTimes(1);
    expect(mockMeetingRepository.find).toHaveBeenCalledTimes(1);
    expect(mockReconsiderationTypeRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should map the repos to the right response keys', async () => {
    const mockTypes = [
      {
        code: '1',
      },
    ];
    mockTypeRepository.find.mockResolvedValue(mockTypes as ApplicationType[]);

    const mockStatuses = [
      {
        code: '2',
      },
    ];
    mockStatusRepository.find.mockResolvedValue(mockStatuses as CardStatus[]);

    const mockRegions = [
      {
        code: '3',
      },
    ];
    mockRegionRepository.find.mockResolvedValue(
      mockRegions as ApplicationRegion[],
    );

    const mockMeetingTypes = [
      {
        code: '4',
      },
    ];
    mockMeetingRepository.find.mockResolvedValue(
      mockMeetingTypes as ApplicationMeetingType[],
    );

    const mockReconsiderationTypes = [
      {
        code: '5',
      },
    ];
    mockReconsiderationTypeRepository.find.mockResolvedValue(
      mockReconsiderationTypes as any[],
    );

    const res = await service.getAll();

    expect(res.type).toEqual(mockTypes);
    expect(res.status).toEqual(mockStatuses);
    expect(res.region).toEqual(mockRegions);
    expect(res.meetingTypes).toEqual(mockMeetingTypes);
    expect(res.reconsiderationTypes).toEqual(mockReconsiderationTypes);
  });

  it('should call the type repo for types', async () => {
    const mockType = {
      code: '1',
    };
    mockTypeRepository.findOne.mockResolvedValue(mockType as ApplicationType);

    const res = await service.fetchApplicationType('code');

    expect(mockTypeRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockType);
  });

  it('should call the status repo for status', async () => {
    const mockStatus = {
      code: '2',
    };
    mockStatusRepository.findOne.mockResolvedValue(mockStatus as CardStatus);

    const res = await service.fetchCardStatus('code');

    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockStatus);
  });

  it('should call the region repo for regions', async () => {
    const mockRegion = {
      code: '1',
    };
    mockRegionRepository.findOne.mockResolvedValue(
      mockRegion as ApplicationRegion,
    );

    const res = await service.fetchRegion('code');

    expect(mockRegionRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockRegion);
  });

  it('should call the meeting type repo for application meeting types', async () => {
    const mockMeetingType = {
      code: '1',
    };
    mockMeetingRepository.findOne.mockResolvedValue(
      mockMeetingType as ApplicationMeetingType,
    );

    const res = await service.fetchMeetingType('code');

    expect(mockMeetingRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockMeetingType);
  });
});
