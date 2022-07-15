import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../common/utils/test-helpers/mockTypes';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { ApplicationCreateDto, ApplicationDto } from './application.dto';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: ApplicationService;
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationCreateDto: ApplicationCreateDto = {
    title: mockApplicationEntity.title,
    number: mockApplicationEntity.number,
    body: mockApplicationEntity.body,
    statusId: mockApplicationEntity.statusId,
  };

  const mockApplicationDto: ApplicationDto = {
    title: mockApplicationEntity.title,
    number: mockApplicationEntity.number,
    body: mockApplicationEntity.body,
    status: {
      code: mockApplicationEntity.status.code,
      description: mockApplicationEntity.status.description,
    },
  };

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
    jest
      .spyOn(applicationService, 'createOrUpdate')
      .mockImplementation(async () => mockApplicationEntity);

    expect(await controller.add(mockApplicationCreateDto)).toStrictEqual(
      mockApplicationDto,
    );
  });

  it('can getall', async () => {
    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [mockApplicationEntity]);

    expect(await controller.getAll()).toStrictEqual([mockApplicationDto]);
  });
});
