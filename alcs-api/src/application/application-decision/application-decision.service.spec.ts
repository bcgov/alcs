import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { DocumentService } from '../../document/document.service';
import { ApplicationService } from '../application.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { ApplicationDecisionService } from './application-decision.service';
import { DecisionDocument } from './decision-document.entity';

describe('ApplicationDecisionService', () => {
  let service: ApplicationDecisionService;
  let mockDecisionRepository: DeepMocked<Repository<ApplicationDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<Repository<DecisionDocument>>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockDocumentService = createMock<DocumentService>();
    mockDecisionRepository = createMock<Repository<ApplicationDecision>>();
    mockDecisionDocumentRepository = createMock<Repository<DecisionDocument>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionService,
        {
          provide: getRepositoryToken(ApplicationDecision),
          useValue: mockDecisionRepository,
        },
        {
          provide: getRepositoryToken(DecisionDocument),
          useValue: mockDecisionDocumentRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionService>(
      ApplicationDecisionService,
    );

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    mockDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockDecisionRepository.save.mockResolvedValue(mockDecision);
    mockApplicationService.get.mockResolvedValue(mockApplication);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get decision meetings for application', async () => {
    const result = await service.getByAppFileNumber(mockApplication.fileNumber);

    expect(result).toStrictEqual([mockDecision]);
  });

  it('should fail on get decision meetings if application does not exist', async () => {
    mockApplicationService.get.mockResolvedValue(null);

    await expect(
      service.getByAppFileNumber('fake-file-number'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        'Application with provided number not found fake-file-number',
      ),
    );
  });

  it('should return empty array if no meetings for application', async () => {
    mockDecisionRepository.find.mockResolvedValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return decision meeting by uuid', async () => {
    const result = await service.get(mockDecision.uuid);

    expect(result).toStrictEqual(mockDecision);
  });

  it('should delete meeting with uuid', async () => {
    mockDecisionRepository.softRemove.mockResolvedValue({} as any);

    await service.delete(mockDecision.uuid);

    expect(mockDecisionRepository.softRemove).toBeCalledTimes(1);
  });

  it('should create meeting', async () => {
    const meetingToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
      applicationFileNumber: 'file-number',
      outcome: 'Outcome',
    } as CreateApplicationDecisionDto;

    await service.create(meetingToCreate, mockApplication);

    expect(mockDecisionRepository.findOne).toBeCalledTimes(0);
    expect(mockDecisionRepository.save).toBeCalledTimes(1);
  });

  it('should update meeting', async () => {
    const decisionUpdate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
      outcome: 'New Outcome',
    } as UpdateApplicationDecisionDto;

    await service.update(mockDecision.uuid, decisionUpdate);

    expect(mockDecisionRepository.findOne).toBeCalledTimes(1);
    expect(mockDecisionRepository.findOne).toBeCalledWith({
      where: { uuid: mockDecision.uuid },
    });
    expect(mockDecisionRepository.save).toBeCalledTimes(1);
  });

  it('should fail on update if meeting not found', async () => {
    const nonExistantUuid = 'bad-uuid';
    mockDecisionRepository.findOne.mockReturnValue(undefined);
    const decisionUpdate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
      outcome: 'New Outcome',
    } as UpdateApplicationDecisionDto;

    expect(mockDecisionRepository.save).toBeCalledTimes(0);
    await expect(
      service.update(nonExistantUuid, decisionUpdate),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Decison Meeting with UUID ${nonExistantUuid} not found`,
      ),
    );
  });
});
