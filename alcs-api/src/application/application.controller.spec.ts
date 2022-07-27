import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleGuard } from '../common/authorization/role.guard';
import {
  mockKeyCloakProviders,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { BusinessDayService } from '../providers/business-days/business-day.service';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { ApplicationDto } from './application.dto';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';

jest.mock('../common/authorization/role.guard', () => ({
  RoleGuard: createMock<RoleGuard>(),
}));

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: ApplicationService;
  let mockBusinessDays: DeepMocked<BusinessDayService>;
  const applicationStatusService = createMock<ApplicationStatusService>();
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    title: mockApplicationEntity.title,
    fileNumber: mockApplicationEntity.fileNumber,
    body: mockApplicationEntity.body,
    status: mockApplicationEntity.status.code,
    assigneeUuid: mockApplicationEntity.assigneeUuid,
    assignee: mockApplicationEntity.assignee,
    activeDays: 2,
    pausedDays: 0,
  };

  beforeEach(async () => {
    mockBusinessDays = createMock<BusinessDayService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        ApplicationService,
        {
          provide: ApplicationStatusService,
          useValue: applicationStatusService,
        },
        {
          provide: BusinessDayService,
          useValue: mockBusinessDays,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    applicationService = module.get<ApplicationService>(ApplicationService);
    applicationStatusService.fetchStatus.mockResolvedValue(
      createMock<ApplicationStatus>(),
    );
    controller = module.get<ApplicationController>(ApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delete', async () => {
    const applicationNumberToDelete = 'app_1';
    jest.spyOn(applicationService, 'delete').mockImplementation();

    await controller.softDelete(applicationNumberToDelete);

    expect(applicationService.delete).toBeCalledTimes(1);
    expect(applicationService.delete).toBeCalledWith(applicationNumberToDelete);
  });

  it('should add', async () => {
    jest
      .spyOn(applicationService, 'createOrUpdate')
      .mockImplementation(async () => mockApplicationEntity);

    expect(await controller.add(mockApplicationDto)).toStrictEqual(
      mockApplicationDto,
    );
  });

  it('should add business days to getAll', async () => {
    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [mockApplicationEntity]);

    const res = await controller.getAll();

    expect(res).toStrictEqual([mockApplicationDto]);
    expect(mockBusinessDays.calculateDays).toHaveBeenCalled();
  });
});
