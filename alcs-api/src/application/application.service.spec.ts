import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let applicationRepositoryMock: MockType<Repository<Application>>;
  const applicationMockEntity = initApplicationMockEntity();
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;

  beforeEach(async () => {
    mockApplicationTimeService = createMock<ApplicationTimeTrackingService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeService,
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
    expect(await applicationService.getAll()).toStrictEqual([
      applicationMockEntity,
    ]);
  });

  it('should getall applications by status', async () => {
    expect(
      await applicationService.getAll([applicationMockEntity.statusUuid]),
    ).toStrictEqual([applicationMockEntity]);
  });

  it('should delete application', async () => {
    await applicationService.delete(applicationMockEntity.fileNumber);
    expect(applicationService.delete).toBeDefined();
  });

  it('should call update when resetApplicationStatus is performed', async () => {
    const targetStatusId = 'app_st_2';
    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [applicationMockEntity]);
    jest.spyOn(applicationService, 'createOrUpdate').mockImplementation();

    await applicationService.resetApplicationStatus(
      applicationMockEntity.statusUuid,
      targetStatusId,
    );

    expect(applicationRepositoryMock.update).toBeCalledTimes(1);
  });

  it('should call save when an Application is created', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(applicationMockEntity);

    const payload: Partial<Application> = {
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      statusUuid: applicationMockEntity.statusUuid,
    };

    expect(await applicationService.createOrUpdate(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(applicationRepositoryMock.save).toHaveBeenCalled();
  });

  it('should call save when an Application is updated', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);

    const payload: Partial<Application> = {
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      statusUuid: applicationMockEntity.statusUuid,
    };

    expect(await applicationService.createOrUpdate(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(applicationRepositoryMock.save).toHaveBeenCalled();
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

    mockApplicationTimeService.fetchApplicationActiveTimes.mockResolvedValue(
      mockApplicationTimeMap,
    );

    const result = await applicationService.getApplicationsNearExpiryDates(
      new Date(10, 5),
      new Date(11, 6),
    );

    expect(result).toStrictEqual([applicationMockEntity]);
    expect(
      mockApplicationTimeService.fetchApplicationActiveTimes,
    ).toBeCalledTimes(1);
  });

  it('should not return applications near expiry', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    applicationRepositoryMock.find.mockReturnValue([applicationMockEntity]);

    mockApplicationTimeService.fetchApplicationActiveTimes.mockResolvedValue(
      new Map<string, ApplicationTimeData>(),
    );

    const result = await applicationService.getApplicationsNearExpiryDates(
      new Date(10, 5),
      new Date(11, 6),
    );

    expect(result).toStrictEqual([]);
    expect(
      mockApplicationTimeService.fetchApplicationActiveTimes,
    ).toBeCalledTimes(1);
  });
});
