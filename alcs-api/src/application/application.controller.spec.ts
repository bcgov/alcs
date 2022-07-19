import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../common/utils/test-helpers/mockTypes';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { ApplicationDto } from './application.dto';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: ApplicationService;
  const applicationStatusService = createMock<ApplicationStatusService>();
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    title: mockApplicationEntity.title,
    fileNumber: mockApplicationEntity.fileNumber,
    body: mockApplicationEntity.body,
    status: mockApplicationEntity.status.code,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        ApplicationService,
        {
          provide: ApplicationStatusService,
          useValue: applicationStatusService,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    applicationService = module.get<ApplicationService>(ApplicationService);
    applicationStatusService.fetchStatusId.mockResolvedValue('fake-status-id');
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
      .spyOn(applicationService, 'create')
      .mockImplementation(async () => mockApplicationEntity);

    expect(await controller.add(mockApplicationDto)).toStrictEqual(
      mockApplicationDto,
    );
  });

  it('should getall', async () => {
    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [mockApplicationEntity]);

    expect(await controller.getAll()).toStrictEqual([mockApplicationDto]);
  });
});
