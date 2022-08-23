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
import { NotificationService } from '../notification/notification.service';
import { ApplicationCodeService } from './application-code/application-code.service';
import { ApplicationDecisionMaker } from './application-code/application-decision-maker/application-decision-maker.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationTimeData } from './application-time-tracking.service';
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
  let applicationCodeService: DeepMocked<ApplicationCodeService>;
  let notificationService: DeepMocked<NotificationService>;
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
    applicationService = createMock<ApplicationService>();
    applicationCodeService = createMock<ApplicationCodeService>();
    notificationService = createMock<NotificationService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController, ApplicationProfile, UserProfile],
      providers: [
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationCodeService,
          useValue: applicationCodeService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
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

    applicationService.mapToDtos.mockResolvedValue([mockApplicationDto]);
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
    expect(applicationService.getAll.mock.calls[0][0]).toEqual({
      decisionMaker: mockDecisionMaker,
    });
  });

  it('should throw an exception when application is not found during update', async () => {
    applicationService.get.mockResolvedValue(undefined);

    await expect(
      controller.update(
        {
          fileNumber: '11',
          applicant: 'New Applicant',
        },
        {},
      ),
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
    } as unknown as Application);
    applicationService.mapToDtos.mockResolvedValue([
      {
        applicant: mockUpdate.applicant,
      } as unknown as ApplicationDto,
    ]);

    const res = await controller.update(mockUpdate, {});

    expect(res.applicant).toEqual(mockUpdate.applicant);
    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(notificationService.createForApplication).not.toHaveBeenCalled();
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

    await controller.update(mockUpdate, {});

    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(notificationService.createForApplication).not.toHaveBeenCalled();
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

    await controller.update(mockUpdate, {});

    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(notificationService.createForApplication).not.toHaveBeenCalled();
    const savedData = applicationService.createOrUpdate.mock.calls[0][0];
    expect(savedData.typeUuid).toEqual(mockUuid);
  });

  it('should call notification service when assignee is changed', async () => {
    const mockUserUuid = 'fake-user';
    const mockUpdate = {
      fileNumber: '11',
      assigneeUuid: mockUserUuid,
    };

    const fakeAuthor = {
      uuid: 'fake-auther',
    };

    applicationService.get.mockResolvedValue(mockApplicationEntity);
    applicationService.createOrUpdate.mockResolvedValue({
      ...mockApplicationEntity,
      assigneeUuid: mockUserUuid,
    } as Application);

    await controller.update(mockUpdate, {
      user: {
        entity: fakeAuthor,
      },
    });

    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(notificationService.createForApplication).toHaveBeenCalled();
    const savedData = applicationService.createOrUpdate.mock.calls[0][0];
    expect(savedData.assigneeUuid).toEqual(mockUserUuid);

    const notificationArgs =
      notificationService.createForApplication.mock.calls[0];
    expect(notificationArgs[0]).toStrictEqual(fakeAuthor);
    expect(notificationArgs[1]).toStrictEqual(mockUserUuid);
    expect(notificationArgs[3]).toStrictEqual({
      ...mockApplicationEntity,
      assigneeUuid: mockUserUuid,
    });
  });

  it('should not call notification service when assignee is changed to user who changed it', async () => {
    const mockUserUuid = 'fake-author';
    const mockUpdate = {
      fileNumber: '11',
      assigneeUuid: mockUserUuid,
    };

    const fakeAuthor = {
      uuid: mockUserUuid,
    };

    applicationService.get.mockResolvedValue(mockApplicationEntity);
    applicationService.createOrUpdate.mockResolvedValue({
      ...mockApplicationEntity,
      assigneeUuid: mockUserUuid,
    } as Application);

    await controller.update(mockUpdate, {
      user: {
        entity: fakeAuthor,
      },
    });

    expect(applicationService.createOrUpdate).toHaveBeenCalled();
    expect(notificationService.createForApplication).not.toHaveBeenCalled();
    const savedData = applicationService.createOrUpdate.mock.calls[0][0];
    expect(savedData.assigneeUuid).toEqual(mockUserUuid);
  });
});
