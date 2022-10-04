import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { ApplicationService } from '../application.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { ApplicationDecisionService } from './application-decision.service';

describe('ApplicationDecisionService', () => {
  let service: ApplicationDecisionService;
  let mockAppDecisionRepository: DeepMocked<Repository<ApplicationDecision>>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockAppDecisionRepository = createMock<Repository<ApplicationDecision>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionService,
        {
          provide: getRepositoryToken(ApplicationDecision),
          useValue: mockAppDecisionRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionService>(
      ApplicationDecisionService,
    );

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    mockAppDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockAppDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockAppDecisionRepository.save.mockResolvedValue(mockDecision);
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
    mockAppDecisionRepository.find.mockResolvedValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return decision meeting by uuid', async () => {
    const result = await service.get(mockDecision.uuid);

    expect(result).toStrictEqual(mockDecision);
  });

  it('should delete meeting with uuid', async () => {
    mockAppDecisionRepository.softRemove.mockResolvedValue({} as any);

    await service.delete(mockDecision.uuid);

    expect(mockAppDecisionRepository.softRemove).toBeCalledTimes(1);
  });

  it('should create meeting', async () => {
    const meetingToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
      applicationFileNumber: 'file-number',
      outcome: 'Outcome',
    } as CreateApplicationDecisionDto;

    await service.create(meetingToCreate, mockApplication);

    expect(mockAppDecisionRepository.findOne).toBeCalledTimes(0);
    expect(mockAppDecisionRepository.save).toBeCalledTimes(1);
  });

  it('should update meeting', async () => {
    const decisionUpdate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
      outcome: 'New Outcome',
    } as UpdateApplicationDecisionDto;

    await service.update(mockDecision.uuid, decisionUpdate);

    expect(mockAppDecisionRepository.findOne).toBeCalledTimes(1);
    expect(mockAppDecisionRepository.findOne).toBeCalledWith({
      where: { uuid: mockDecision.uuid },
    });
    expect(mockAppDecisionRepository.save).toBeCalledTimes(1);
  });

  it('should fail on update if meeting not found', async () => {
    const nonExistantUuid = 'bad-uuid';
    mockAppDecisionRepository.findOne.mockReturnValue(undefined);
    const decisionUpdate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
      outcome: 'New Outcome',
    } as UpdateApplicationDecisionDto;

    expect(mockAppDecisionRepository.save).toBeCalledTimes(0);
    await expect(
      service.update(nonExistantUuid, decisionUpdate),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Decison Meeting with UUID ${nonExistantUuid} not found`,
      ),
    );
  });
});
