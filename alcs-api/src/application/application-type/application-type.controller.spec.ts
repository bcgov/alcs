import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationTypeController } from './application-type.controller';
import { ApplicationTypeDto } from './application-type.dto';
import { ApplicationType } from './application-type.entity';
import { ApplicationTypeService } from './application-type.service';

describe('ApplicationTypeController', () => {
  let controller: ApplicationTypeController;
  let applicationTypeService: ApplicationTypeService;
  const applicationStatusDto: ApplicationTypeDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
    shortLabel: 'short_label',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationTypeController],
      providers: [
        ApplicationTypeService,
        {
          provide: getRepositoryToken(ApplicationType),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    applicationTypeService = module.get<ApplicationTypeService>(
      ApplicationTypeService,
    );
    controller = module.get<ApplicationTypeController>(
      ApplicationTypeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should getall', async () => {
    const result: ApplicationTypeDto[] = [applicationStatusDto];

    jest
      .spyOn(applicationTypeService, 'getAll')
      .mockImplementation(async () => [
        {
          ...applicationStatusDto,
          auditCreatedAt: 0,
          auditCreatedBy: '',
          auditUpdatedAt: 0,
          auditUpdatedBy: '',
          uuid: '',
        } as any as ApplicationType,
      ]);

    expect(await controller.getAll()).toStrictEqual(result);
  });
});
