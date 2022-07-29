import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleGuard } from '../common/authorization/role.guard';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import {
  initApplicationMockEntity,
  initAssigneeMockDto,
} from '../common/utils/test-helpers/mockEntities';
import {
  mockKeyCloakProviders,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import { ApplicationType } from './application-type/application-type.entity';
import { ApplicationTypeService } from './application-type/application-type.service';
import { ApplicationController } from './application.controller';
import { ApplicationDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

jest.mock('../common/authorization/role.guard', () => ({
  RoleGuard: createMock<RoleGuard>(),
}));

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: DeepMocked<ApplicationService>;
  let applicationTypeService: DeepMocked<ApplicationTypeService>;
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;
  const applicationStatusService = createMock<ApplicationStatusService>();
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    title: mockApplicationEntity.title,
    fileNumber: mockApplicationEntity.fileNumber,
    applicant: mockApplicationEntity.applicant,
    status: mockApplicationEntity.status.code,
    type: mockApplicationEntity.type.code,
    assigneeUuid: mockApplicationEntity.assigneeUuid,
    assignee: initAssigneeMockDto(),
    activeDays: 2,
    pausedDays: 0,
    paused: mockApplicationEntity.paused,
  };

  beforeEach(async () => {
    mockApplicationTimeService = createMock<ApplicationTimeTrackingService>();
    applicationTypeService = createMock<ApplicationTypeService>();
    applicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController, ApplicationProfile, UserProfile],
      providers: [
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationStatusService,
          useValue: applicationStatusService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeService,
        },
        {
          provide: ApplicationTypeService,
          useValue: applicationTypeService,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
        ...mockKeyCloakProviders,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();
    applicationStatusService.fetchStatus.mockResolvedValue(
      createMock<ApplicationStatus>(),
    );
    controller = module.get<ApplicationController>(ApplicationController);

    const mockTimesMap = new Map<string, ApplicationTimeData>();
    mockTimesMap.set(mockApplicationEntity.uuid, {
      activeDays: 2,
      pausedDays: 0,
    });
    mockApplicationTimeService.fetchApplicationActiveTimes.mockResolvedValue(
      mockTimesMap,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delete', async () => {
    applicationService.delete.mockResolvedValue();
    const applicationNumberToDelete = 'app_1';
    await controller.softDelete(applicationNumberToDelete);

    expect(applicationService.delete).toHaveBeenCalled();
    expect(applicationService.delete).toHaveBeenCalledWith(
      applicationNumberToDelete,
    );
  });

  it('should add', async () => {
    applicationService.createOrUpdate.mockResolvedValue(mockApplicationEntity);

    const res = await controller.add(mockApplicationDto);

    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(res).toStrictEqual(mockApplicationDto);
  });

  it('should add active and paused days to getAll', async () => {
    applicationService.getAll.mockResolvedValue([mockApplicationEntity]);

    const res = await controller.getAll();

    expect(res[0].pausedDays).toEqual(0);
    expect(
      mockApplicationTimeService.fetchApplicationActiveTimes,
    ).toHaveBeenCalled();
  });

  it('should throw an exception when application is not found during update', async () => {
    applicationService.get.mockResolvedValue(undefined);

    await expect(
      controller.update({
        fileNumber: '11',
        applicant: 'New Applicant',
      }),
    ).rejects.toMatchObject(new Error(`File not found`));
  });

  it('should update only the given fields', async () => {
    const mockUpdate = {
      fileNumber: '11',
      applicant: 'New Applicant',
    };

    applicationService.get.mockResolvedValue(mockApplicationEntity);
    applicationService.createOrUpdate.mockResolvedValue({
      ...mockApplicationEntity,
      applicant: mockUpdate.applicant,
    } as Application);

    const res = await controller.update(mockUpdate);

    expect(res.applicant).toEqual(mockUpdate.applicant);
    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(applicationService.createOrUpdate).toHaveBeenCalledWith(mockUpdate);
  });

  it('should handle updating status', async () => {
    const mockStatus = 'NEW_STATUS';
    const mockUuid = 'uuid';
    const mockUpdate = {
      fileNumber: '11',
      status: mockStatus,
    };

    applicationStatusService.fetchStatus.mockResolvedValue({
      uuid: mockUuid,
      code: mockStatus,
    } as ApplicationStatus);
    applicationService.get.mockResolvedValue(mockApplicationEntity);
    applicationService.createOrUpdate.mockResolvedValue({
      ...mockApplicationEntity,
      status: {
        code: mockStatus,
        label: '',
        description: '',
      },
    } as Application);

    const res = await controller.update(mockUpdate);

    expect(res.status).toEqual(mockUpdate.status);
    expect(applicationService.createOrUpdate).toHaveBeenCalled();

    const savedData = applicationService.createOrUpdate.mock.calls[0][0];
    expect(savedData.statusUuid).toEqual(mockUuid);
  });

  it('should handle updating type', async () => {
    const mockType = 'NEW_STATUS';
    const mockUuid = 'uuid';
    const mockUpdate = {
      fileNumber: '11',
      type: mockType,
    };

    applicationTypeService.get.mockResolvedValue({
      uuid: mockUuid,
      code: mockType,
    } as ApplicationType);
    applicationService.get.mockResolvedValue(mockApplicationEntity);
    applicationService.createOrUpdate.mockResolvedValue({
      ...mockApplicationEntity,
      status: {
        code: mockType,
        label: '',
        description: '',
      },
    } as Application);

    const res = await controller.update(mockUpdate);

    expect(res.status).toEqual(mockUpdate.type);
    expect(applicationService.createOrUpdate).toHaveBeenCalled();

    const savedData = applicationService.createOrUpdate.mock.calls[0][0];
    expect(savedData.typeUuid).toEqual(mockUuid);
  });
});
