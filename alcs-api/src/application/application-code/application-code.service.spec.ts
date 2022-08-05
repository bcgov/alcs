import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { repositoryMockFactory } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationCodeService } from './application-code.service';
import { ApplicationDecisionMaker } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationType } from './application-type/application-type.entity';

describe('ApplicationCodeService', () => {
  let mockTypeRepository: DeepMocked<Repository<ApplicationType>>;
  let mockStatusRepository: DeepMocked<Repository<ApplicationStatus>>;
  let mockDecisionMakerRepository: DeepMocked<
    Repository<ApplicationDecisionMaker>
  >;

  let service: ApplicationCodeService;

  beforeEach(async () => {
    mockTypeRepository = createMock<Repository<ApplicationType>>();
    mockStatusRepository = createMock<Repository<ApplicationStatus>>();
    mockDecisionMakerRepository =
      createMock<Repository<ApplicationDecisionMaker>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationCodeService,
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: mockTypeRepository,
        },
        {
          provide: getRepositoryToken(ApplicationStatus),
          useValue: mockStatusRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionMaker),
          useValue: mockDecisionMakerRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationCodeService>(ApplicationCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call all repositories when fetching call', async () => {
    mockTypeRepository.find.mockResolvedValue([]);
    mockStatusRepository.find.mockResolvedValue([]);
    mockDecisionMakerRepository.find.mockResolvedValue([]);

    const res = await service.getAllCodes();

    expect(mockTypeRepository.find).toHaveBeenCalled();
    expect(mockStatusRepository.find).toHaveBeenCalled();
    expect(mockDecisionMakerRepository.find).toHaveBeenCalled();
  });

  it('should map the repos to the right response keys', async () => {
    const mockTypes = [
      {
        uuid: '1',
      },
    ];
    mockTypeRepository.find.mockResolvedValue(mockTypes as ApplicationType[]);

    const mockStatuses = [
      {
        uuid: '2',
      },
    ];
    mockStatusRepository.find.mockResolvedValue(
      mockStatuses as ApplicationStatus[],
    );

    const mockDecisionMakers = [
      {
        uuid: '3',
      },
    ];
    mockDecisionMakerRepository.find.mockResolvedValue(
      mockDecisionMakers as ApplicationDecisionMaker[],
    );

    const res = await service.getAllCodes();

    expect(res.type).toEqual(mockTypes);
    expect(res.status).toEqual(mockStatuses);
    expect(res.decisionMaker).toEqual(mockDecisionMakers);
  });

  it('should call the type repo for types', async () => {
    const mockType = {
      uuid: '1',
    };
    mockTypeRepository.findOne.mockResolvedValue(mockType as ApplicationType);

    const res = await service.fetchType('code');

    expect(mockTypeRepository.findOne).toHaveBeenCalled();
    expect(res).toEqual(mockType);
  });

  it('should call the status repo for status', async () => {
    const mockStatus = {
      uuid: '2',
    };
    mockStatusRepository.findOne.mockResolvedValue(
      mockStatus as ApplicationStatus,
    );

    const res = await service.fetchStatus('code');

    expect(mockStatusRepository.findOne).toHaveBeenCalled();
    expect(res).toEqual(mockStatus);
  });

  it('should call the decision maker repo for decision makers', async () => {
    const mockDecisionMaker = {
      uuid: '1',
    };
    mockDecisionMakerRepository.findOne.mockResolvedValue(
      mockDecisionMaker as ApplicationDecisionMaker,
    );

    const res = await service.fetchDecisionMaker('code');

    expect(mockDecisionMakerRepository.findOne).toHaveBeenCalled();
    expect(res).toEqual(mockDecisionMaker);
  });
});
