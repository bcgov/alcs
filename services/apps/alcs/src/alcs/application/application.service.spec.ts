import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationMockEntity } from '../../../test/mocks/mockEntities';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { ApplicationLocalGovernmentService } from './application-code/application-local-government/application-local-government.service';
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
  let mockApplicationLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockApplicationTimeService = createMock();
    mockCodeService = createMock();
    applicationRepositoryMock = createMock();
    applicationTypeRepositoryMock = createMock();
    mockApplicationLocalGovernmentService = createMock();

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
          provide: ApplicationLocalGovernmentService,
          useValue: mockApplicationLocalGovernmentService,
        },
        {
          provide: getRepositoryToken(Application),
          useValue: applicationRepositoryMock,
        },
        {
          provide: getRepositoryToken(ApplicationType),
          useValue: applicationTypeRepositoryMock,
        },
      ],
    }).compile();

    applicationRepositoryMock = module.get(getRepositoryToken(Application));
    applicationService = module.get<ApplicationService>(ApplicationService);

    applicationTypeRepositoryMock.find.mockResolvedValue([]);

    applicationRepositoryMock.find.mockResolvedValue([applicationMockEntity]);
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.save.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.update.mockReturnValue(applicationMockEntity);
  });

  it('should be defined', () => {
    expect(applicationService).toBeDefined();
  });

  it('should getall applications', async () => {
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
    applicationRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(applicationMockEntity);
    mockCodeService.fetchRegion.mockResolvedValue({} as ApplicationRegion);

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
    expect(mockCodeService.fetchRegion).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should call faile to create if file number already exists', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    const createDto: CreateApplicationServiceDto = {
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      localGovernmentUuid: 'government-uuid',
      typeCode: 'type',
      regionCode: 'region',
      dateSubmittedToAlc: new Date(),
    };

    const promise = applicationService.create(createDto);

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(
        'Application with file number already exists',
      ),
    );
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(0);
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
    applicationRepositoryMock.softRemove.mockResolvedValue({} as any);

    await applicationService.updateByUuid(applicationMockEntity.uuid, {
      applicant: 'new-applicant',
    });

    expect(applicationRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(applicationRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should fail to update if application does not exist', async () => {
    applicationRepositoryMock.findOne.mockResolvedValue(null);

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

    expect(applicationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should generate and return new fileNumber', async () => {
    applicationRepositoryMock.findOne
      .mockResolvedValueOnce({} as Application)
      .mockResolvedValue(null);
    applicationRepositoryMock.query.mockResolvedValue([
      { nextval: applicationMockEntity.uuid },
    ]);

    const result = await applicationService.generateNextFileNumber();

    expect(applicationRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(applicationRepositoryMock.query).toBeCalledTimes(2);
    expect(result).toEqual(applicationMockEntity.uuid);
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

    applicationRepositoryMock.findOneOrFail.mockResolvedValue(
      {} as Application,
    );

    const result = await applicationService.getByUuidOrFail(fakeUuid);

    expect(applicationRepositoryMock.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(applicationRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
      where: {
        uuid: fakeUuid,
      },
    });
    expect(result).toBeDefined();
  });
});
