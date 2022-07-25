import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../common/utils/test-helpers/mockTypes';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationStatusController } from './application-status.controller';
import { ApplicationStatus } from './application-status.entity';
import { ApplicationStatusService } from './application-status.service';
import { ApplicationStatusDto } from './application-status.dto';
import { initApplicationStatusMockEntity } from '../../common/utils/test-helpers/mockEntities';

describe('ApplicationStatusController', () => {
  let controller: ApplicationStatusController;
  let applicationStatusService: ApplicationStatusService;
  const mockApplicationStatusEntity = initApplicationStatusMockEntity();
  const applicationStatusDto: ApplicationStatusDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
  };

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

  it('should getall', async () => {
    const result: ApplicationStatusDto[] = [applicationStatusDto];

    jest
      .spyOn(applicationStatusService, 'getAll')
      .mockImplementation(async () => [mockApplicationStatusEntity]);

    expect(await controller.getAll()).toStrictEqual(result);
  });
});
