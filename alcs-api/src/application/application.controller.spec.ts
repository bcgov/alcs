import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../common/utils/mockTypes';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { ApplicationCreateDto, ApplicationDto } from './application.dto';
import { ApplicationStatus } from '../application-status/application-status.entity';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: ApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    applicationService = module.get<ApplicationService>(ApplicationService);
    controller = module.get<ApplicationController>(ApplicationController);
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

  const initApplicationMockEntity = (): Application => {
    const applicationEntity = new Application();
    applicationEntity.title = 'app_1';
    applicationEntity.number = 'app_1';
    applicationEntity.body = 'app desc 1';
    applicationEntity.id = '1111-1111-1111-1111';
    applicationEntity.auditDeletedDateAt = new Date(2022, 1, 1, 1, 1, 1, 1);
    applicationEntity.auditCreatedAt = 111111111;
    applicationEntity.auditUpdatedAt = 111111111;
    applicationEntity.status = initApplicationStatusMockEntity();
    applicationEntity.statusId = applicationEntity.status.id;

    return applicationEntity;
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('can delete', async () => {
    const applicationNumberToDelete = 'app_1';
    jest.spyOn(applicationService, 'delete').mockImplementation();

    await controller.softDelete(applicationNumberToDelete);

    expect(applicationService.delete).toBeCalledTimes(1);
    expect(applicationService.delete).toBeCalledWith(applicationNumberToDelete);
  });

  it('can add', async () => {
    const mockServiceResult = initApplicationMockEntity();

    jest
      .spyOn(applicationService, 'createOrUpdate')
      .mockImplementation(async () => mockServiceResult);

    const payload: ApplicationCreateDto = {
      title: mockServiceResult.title,
      number: mockServiceResult.number,
      body: mockServiceResult.body,
      statusId: mockServiceResult.statusId,
    };

    const result: ApplicationDto = {
      title: mockServiceResult.title,
      number: mockServiceResult.number,
      body: mockServiceResult.body,
      status: {
        code: mockServiceResult.status.code,
        description: mockServiceResult.status.description,
      },
    };

    expect(await controller.add(payload)).toStrictEqual(result);
  });

  it('can getall', async () => {
    const mockServiceResult = initApplicationMockEntity();
    const result: ApplicationDto[] = [
      {
        title: mockServiceResult.title,
        number: mockServiceResult.number,
        body: mockServiceResult.body,
        status: {
          code: mockServiceResult.status.code,
          description: mockServiceResult.status.description,
        },
      },
    ];

    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [mockServiceResult]);

    expect(await controller.getAll()).toStrictEqual(result);
  });
});
