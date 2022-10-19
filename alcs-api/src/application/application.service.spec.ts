import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { ApplicationPaused } from './application-paused.entity';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import {
  ApplicationUpdateServiceDto,
  CreateApplicationDto,
} from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let applicationRepositoryMock: MockType<Repository<Application>>;
  const applicationMockEntity = initApplicationMockEntity();
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockApplicationTimeService = createMock<ApplicationTimeTrackingService>();
    mockCodeService = createMock<CodeService>();

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
          provide: getRepositoryToken(ApplicationPaused),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    applicationRepositoryMock = module.get(getRepositoryToken(Application));
    applicationService = module.get<ApplicationService>(ApplicationService);

    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.find.mockReturnValue([applicationMockEntity]);
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.save.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.update.mockReturnValue(applicationMockEntity);
  });

  it('should be defined', () => {
    expect(applicationService).toBeDefined();
  });

  it('should getall applications', async () => {
    expect(await applicationService.getAll({})).toStrictEqual([
      applicationMockEntity,
    ]);
  });

  it('should delete application', async () => {
    await applicationService.delete(applicationMockEntity.fileNumber);
    expect(applicationService.delete).toBeDefined();
  });

  it('should call save when an Application is created', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(applicationMockEntity);
    mockCodeService.fetchApplicationType.mockResolvedValue(
      {} as ApplicationType,
    );
    mockCodeService.fetchRegion.mockResolvedValue({} as ApplicationRegion);

    const payload: CreateApplicationDto = {
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      localGovernmentUuid: 'government-uuid',
      typeCode: 'type',
      regionCode: 'region',
      dateReceived: new Date().getTime(),
    };

    expect(await applicationService.create(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(mockCodeService.fetchApplicationType).toHaveBeenCalledTimes(1);
    expect(mockCodeService.fetchRegion).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should call save when an Application is updated', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);

    const payload: ApplicationUpdateServiceDto = {
      applicant: applicationMockEntity.applicant,
    };

    expect(
      await applicationService.updateByFileNumber(
        applicationMockEntity.fileNumber,
        payload,
      ),
    ).toStrictEqual(applicationMockEntity);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should get applications near expiry', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    const applicationMockEntity2 = initApplicationMockEntity();
    applicationMockEntity2.uuid = applicationMockEntity2.uuid + '2';

    applicationRepositoryMock.find.mockReturnValue([
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

    applicationRepositoryMock.find.mockReturnValue([applicationMockEntity]);

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
});
