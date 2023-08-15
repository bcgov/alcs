import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { initApplicationMockEntity } from '../../../test/mocks/mockEntities';
import { ApplicationSubmissionStatusService } from './application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from './application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from './application-submission-status/submission-status.entity';
import { FileNumberService } from '../../file-number/file-number.service';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import {
  ApplicationUpdateServiceDto,
  CreateApplicationServiceDto,
} from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let applicationRepositoryMock: DeepMocked<Repository<Application>>;
  let applicationTypeRepositoryMock: DeepMocked<Repository<ApplicationType>>;
  let applicationMockEntity;
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;
  let mockApplicationLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  const DEFAULT_CARD_RELATIONS: FindOptionsRelations<Card> = {
    status: true,
    assignee: true,
    type: true,
  };
  const BOARD_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: {
      ...DEFAULT_CARD_RELATIONS,
      board: false,
    },
    region: true,
    decisionMeetings: true,
    localGovernment: true,
  };

  beforeEach(async () => {
    mockApplicationTimeService = createMock();
    mockCodeService = createMock();
    applicationRepositoryMock = createMock();
    applicationTypeRepositoryMock = createMock();
    mockApplicationLocalGovernmentService = createMock();
    mockFileNumberService = createMock();
    mockApplicationSubmissionStatusService = createMock();

    applicationMockEntity = initApplicationMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationService,
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockApplicationLocalGovernmentService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
        {
          provide: getRepositoryToken(Application),
          useValue: applicationRepositoryMock,
        },
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: applicationTypeRepositoryMock,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
      ],
    }).compile();

    applicationRepositoryMock = module.get(getRepositoryToken(Application));
    applicationService = module.get<ApplicationService>(ApplicationService);

    applicationTypeRepositoryMock.find.mockResolvedValue([]);

    applicationRepositoryMock.find.mockResolvedValue([applicationMockEntity]);
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.findOneOrFail.mockResolvedValue(
      applicationMockEntity,
    );
    applicationRepositoryMock.save.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.update.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.exist.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(applicationService).toBeDefined();
  });

  it('should get all applications', async () => {
    expect(await applicationService.getMany({})).toStrictEqual([
      applicationMockEntity,
    ]);
  });

  it('should delete application', async () => {
    applicationRepositoryMock.softRemove.mockResolvedValue({} as any);

    await applicationService.delete(applicationMockEntity.fileNumber);
    expect(applicationRepositoryMock.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should call save when an Application is created', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockResolvedValue(applicationMockEntity);
    mockCodeService.fetchRegion.mockResolvedValue({} as ApplicationRegion);
    mockFileNumberService.checkValidFileNumber.mockResolvedValue(true);

    const payload: CreateApplicationServiceDto = {
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      localGovernmentUuid: 'government-uuid',
      typeCode: 'type',
      regionCode: 'region',
      dateSubmittedToAlc: new Date(),
    };

    expect(await applicationService.create(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(mockFileNumberService.checkValidFileNumber).toHaveBeenCalledTimes(1);
    expect(mockCodeService.fetchRegion).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should call update when an Application is updated', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockResolvedValue(applicationMockEntity);

    const payload: ApplicationUpdateServiceDto = {
      applicant: applicationMockEntity.applicant,
    };

    expect(
      await applicationService.updateByFileNumber(
        applicationMockEntity.fileNumber,
        payload,
      ),
    ).toStrictEqual(applicationMockEntity);
    expect(applicationRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should get applications near expiry', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    const applicationMockEntity2 = initApplicationMockEntity();
    applicationMockEntity2.uuid = applicationMockEntity2.uuid + '2';

    applicationRepositoryMock.find.mockResolvedValue([
      applicationMockEntity,
      applicationMockEntity2,
    ]);

    const mockApplicationTimeMap = new Map<string, ApplicationTimeData>();
    mockApplicationTimeMap.set(applicationMockEntity.uuid, {
      activeDays: 55,
      pausedDays: 50,
    });
    mockApplicationTimeMap.set(applicationMockEntity2.uuid, {
      activeDays: 54,
      pausedDays: 50,
    });

    mockApplicationTimeService.fetchActiveTimes.mockResolvedValue(
      mockApplicationTimeMap,
    );

    const result = await applicationService.getAllNearExpiryDates(
      new Date(10, 5),
      new Date(11, 6),
    );

    expect(result).toStrictEqual([applicationMockEntity]);
    expect(mockApplicationTimeService.fetchActiveTimes).toBeCalledTimes(1);
  });

  it('should not return applications near expiry', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    applicationRepositoryMock.find.mockResolvedValueOnce([
      applicationMockEntity,
    ]);

    mockApplicationTimeService.fetchActiveTimes.mockResolvedValue(
      new Map<string, ApplicationTimeData>(),
    );

    const result = await applicationService.getAllNearExpiryDates(
      new Date(10, 5),
      new Date(11, 6),
    );

    expect(result).toStrictEqual([]);
    expect(mockApplicationTimeService.fetchActiveTimes).toBeCalledTimes(1);
  });

  it('should call through for updateByUuid', async () => {
    await applicationService.updateByUuid(applicationMockEntity.uuid, {
      applicant: 'new-applicant',
    });

    expect(applicationRepositoryMock.exist).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should fail to update if application does not exist', async () => {
    applicationRepositoryMock.exist.mockResolvedValue(false);

    const promise = applicationService.updateByUuid(
      applicationMockEntity.uuid,
      {
        applicant: 'new-applicant',
      },
    );

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Application not found with file number ${applicationMockEntity.uuid}`,
      ),
    );

    expect(applicationRepositoryMock.exist).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should load deleted card', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(null);

    await applicationService.getDeletedCard('card');

    expect(applicationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(
      applicationRepositoryMock.findOne.mock.calls[0][0].withDeleted,
    ).toEqual(true);
  });

  it('should get application by uuid', async () => {
    const fakeUuid = 'fake';

    const result = await applicationService.getByUuidOrFail(fakeUuid);

    expect(applicationRepositoryMock.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
      where: {
        uuid: fakeUuid,
      },
    });
    expect(result).toBeDefined();
  });

  it('should get apps by board code', async () => {
    applicationRepositoryMock.find.mockResolvedValue([]);

    const fakeBoardUuid = 'fake';
    await applicationService.getByBoard(fakeBoardUuid);
    expect(applicationRepositoryMock.find).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.find).toHaveBeenCalledWith({
      where: {
        card: {
          boardUuid: fakeBoardUuid,
        },
      },
      relations: BOARD_RELATIONS,
    });
  });

  it('should set the cancelled status for cancel', async () => {
    mockApplicationSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    await applicationService.cancel('');
    expect(
      mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith('', SUBMISSION_STATUS.CANCELLED);
  });

  it('should clear the cancelled status for uncancel', async () => {
    mockApplicationSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    await applicationService.uncancel('');
    expect(
      mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith('', SUBMISSION_STATUS.CANCELLED, null);
  });
});
