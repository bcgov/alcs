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
import { ApplicationCodeService } from './application-code/application-code.service';
import { ApplicationDecisionMaker } from './application-code/application-decision-maker/application-decision-maker.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
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
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;
  let applicationCodeService: DeepMocked<ApplicationCodeService>;
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    fileNumber: mockApplicationEntity.fileNumber,
    applicant: mockApplicationEntity.applicant,
    status: mockApplicationEntity.status.code,
    type: mockApplicationEntity.type.code,
    assigneeUuid: mockApplicationEntity.assigneeUuid,
    decisionMaker: undefined,
    region: undefined,
    assignee: initAssigneeMockDto(),
    activeDays: 2,
    pausedDays: 0,
    paused: mockApplicationEntity.paused,
    highPriority: mockApplicationEntity.highPriority,
  };

  beforeEach(async () => {
    mockApplicationTimeService = createMock<ApplicationTimeTrackingService>();
    applicationService = createMock<ApplicationService>();
    applicationCodeService = createMock<ApplicationCodeService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController, ApplicationProfile, UserProfile],
      providers: [
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeService,
        },
        {
          provide: ApplicationCodeService,
          useValue: applicationCodeService,
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
    applicationCodeService.fetchStatus.mockResolvedValue(
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

  it('should return the entity after create', async () => {
    applicationService.createOrUpdate.mockResolvedValue(mockApplicationEntity);

    applicationCodeService.fetchType.mockResolvedValue({
      uuid: 'fake-uuid',
      code: 'fake-code',
    } as ApplicationType);

    const res = await controller.create(mockApplicationDto);

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

  it('should apply the dm filter in getAll', async () => {
    const mockDecisionMaker = createMock<ApplicationDecisionMaker>();
    applicationCodeService.fetchDecisionMaker.mockResolvedValue(
      mockDecisionMaker,
    );
    applicationService.getAll.mockResolvedValue([mockApplicationEntity]);

    await controller.getAll('dm');

    expect(applicationCodeService.fetchDecisionMaker).toHaveBeenCalled();
    expect(applicationCodeService.fetchDecisionMaker.mock.calls[0][0]).toEqual(
      'dm',
    );

    expect(applicationService.getAll).toHaveBeenCalled();
    expect(applicationService.getAll.mock.calls[0][0]).toEqual(
      mockDecisionMaker,
    );
  });

  it('should throw an exception when application is not found during update', async () => {
    applicationService.get.mockResolvedValue(undefined);

    await expect(
      controller.update({
        fileNumber: '11',
        applicant: 'New Applicant',
      }),
    ).rejects.toMatchObject(new Error(`File 11 not found`));
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

    applicationCodeService.fetchStatus.mockResolvedValue({
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

    applicationCodeService.fetchType.mockResolvedValue({
      uuid: mockUuid,
      code: mockType,
    } as ApplicationType);
    applicationService.get.mockResolvedValue(mockApplicationEntity);
    applicationService.createOrUpdate.mockResolvedValue({
      ...mockApplicationEntity,
      type: {
        code: mockType,
        label: '',
        description: '',
      },
    } as Application);

    const res = await controller.update(mockUpdate);

    expect(res.type).toEqual(mockUpdate.type);
    expect(applicationService.createOrUpdate).toHaveBeenCalled();

    const savedData = applicationService.createOrUpdate.mock.calls[0][0];
    expect(savedData.typeUuid).toEqual(mockUuid);
  });
});
