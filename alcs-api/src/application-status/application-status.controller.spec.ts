import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../common/utils/mockTypes';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { ApplicationStatusController } from './application-status.controller';
import { ApplicationStatus } from './application-status.entity';
import { ApplicationStatusService } from './application-status.service';
import { ApplicationStatusDto } from './application-status.dto';

describe('ApplicationStatusController', () => {
  let controller: ApplicationStatusController;
  let applicationStatusService: ApplicationStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationStatusController],
      providers: [
        ApplicationStatusService,
        ApplicationService,
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

  const initApplicationStatusMockEntity = (): ApplicationStatus => {
    const applicationStatus = new ApplicationStatus();
    applicationStatus.code = 'app_1';
    applicationStatus.description = 'app desc 1';
    applicationStatus.id = '1111-1111-1111-1111';
    applicationStatus.auditDeletedDateAt = new Date(2022, 1, 1, 1, 1, 1, 1);
    applicationStatus.auditCreatedAt = 111111111;
    applicationStatus.auditUpdatedAt = 111111111;

    return applicationStatus;
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('can delete', async () => {
    const statusToDelete = 'some_code';
    jest.spyOn(applicationStatusService, 'delete').mockImplementation();

    await controller.softDelete(statusToDelete);

    expect(applicationStatusService.delete).toBeCalledTimes(1);
    expect(applicationStatusService.delete).toBeCalledWith(statusToDelete);
  });

  it('can add', async () => {
    const mockServiceResult = initApplicationStatusMockEntity();
    jest
      .spyOn(applicationStatusService, 'create')
      .mockImplementation(async () => mockServiceResult);

    const result: ApplicationStatusDto = {
      code: 'app_1',
      description: 'app desc 1',
    };

    expect(await controller.add(result)).toStrictEqual(result);
  });

  it('can getall', async () => {
    const mockServiceResult = initApplicationStatusMockEntity();
    const result: ApplicationStatusDto[] = [
      {
        code: 'app_1',
        description: 'app desc 1',
      },
    ];

    jest
      .spyOn(applicationStatusService, 'getAll')
      .mockImplementation(async () => [mockServiceResult]);

    expect(await controller.getAll()).toStrictEqual(result);
  });
});
