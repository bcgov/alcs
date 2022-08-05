import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { initApplicationStatusMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { repositoryMockFactory } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationTimeTrackingService } from '../application-time-tracking.service';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationStatusController } from './application-status.controller';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatus } from './application-status.entity';
import { ApplicationStatusService } from './application-status.service';

describe('ApplicationStatusController', () => {
  let controller: ApplicationStatusController;
  let applicationStatusService: ApplicationStatusService;
  const mockApplicationStatusEntity = initApplicationStatusMockEntity();
  const applicationStatusDto: ApplicationStatusDto = {
    code: mockApplicationStatusEntity.code,
    description: mockApplicationStatusEntity.description,
    label: mockApplicationStatusEntity.label,
  };
  let applicationService: DeepMocked<ApplicationService>;
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationStatusController],
      providers: [
        ApplicationStatusService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeService,
        },
        {
          provide: getRepositoryToken(ApplicationStatus),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    applicationStatusService = module.get<ApplicationStatusService>(
      ApplicationStatusService,
    );
    controller = module.get<ApplicationStatusController>(
      ApplicationStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delete', async () => {
    const statusToDelete = 'some_code';
    jest.spyOn(applicationStatusService, 'delete').mockImplementation();

    await controller.softDelete(statusToDelete);

    expect(applicationStatusService.delete).toBeCalledTimes(1);
    expect(applicationStatusService.delete).toBeCalledWith(statusToDelete);
  });

  it('should add', async () => {
    jest
      .spyOn(applicationStatusService, 'create')
      .mockImplementation(async () => mockApplicationStatusEntity);

    expect(await controller.add(applicationStatusDto)).toStrictEqual(
      applicationStatusDto,
    );
  });
});
