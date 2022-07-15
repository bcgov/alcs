import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../common/utils/mockTypes';
import { ApplicationStatusService } from '../application-status/application-status.service';
import { ApplicationController } from './application.controller';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationStatusService: ApplicationStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
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
    controller = module.get<ApplicationController>(ApplicationController);
  });

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
});
