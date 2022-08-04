import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { repositoryMockFactory } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationStatusService } from '../application-status/application-status.service';
import { ApplicationTypeService } from '../application-type/application-type.service';
import { ApplicationDecisionMakerController } from './application-decision-maker.controller';
import { ApplicationDecisionMakerDto } from './application-decision-maker.dto';
import { ApplicationDecisionMaker } from './application-decision-maker.entity';
import { ApplicationDecisionMakerService } from './application-decision-maker.service';

describe('ApplicationDecisionMakerController', () => {
  let controller: ApplicationDecisionMakerController;
  let decisionMakerService: DeepMocked<ApplicationDecisionMakerService>;
  const applicationDecisionMakerDto: ApplicationDecisionMakerDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
  };

  beforeEach(async () => {
    decisionMakerService = createMock<ApplicationDecisionMakerService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionMakerController, ApplicationProfile],
      providers: [
        {
          provide: ApplicationTypeService,
          useValue: createMock<ApplicationTypeService>(),
        },
        {
          provide: ApplicationStatusService,
          useValue: createMock<ApplicationStatusService>(),
        },
        {
          provide: ApplicationDecisionMakerService,
          useValue: decisionMakerService,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionMaker),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<ApplicationDecisionMakerController>(
      ApplicationDecisionMakerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should getall', async () => {
    const result: ApplicationDecisionMakerDto[] = [applicationDecisionMakerDto];

    decisionMakerService.getAll.mockResolvedValue([
      {
        ...applicationDecisionMakerDto,
        auditCreatedAt: 0,
        auditCreatedBy: '',
        auditUpdatedAt: 0,
        auditUpdatedBy: '',
        uuid: '',
      } as any as ApplicationDecisionMaker,
    ]);

    expect(await controller.getAll()).toEqual(result);
  });
});
