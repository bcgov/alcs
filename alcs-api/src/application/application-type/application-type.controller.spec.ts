import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { ApplicationDecisionMakerService } from '../application-decision-maker/application-decision-maker.service';
import { ApplicationStatusService } from '../application-status/application-status.service';
import { ApplicationTypeController } from './application-type.controller';
import { ApplicationTypeDto } from './application-type.dto';
import { ApplicationType } from './application-type.entity';
import { ApplicationTypeService } from './application-type.service';

describe('ApplicationTypeController', () => {
  let controller: ApplicationTypeController;
  let applicationTypeService: DeepMocked<ApplicationTypeService>;

  const applicationStatusDto: ApplicationTypeDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
    shortLabel: 'short_label',
    textColor: '',
    backgroundColor: '',
  };

  beforeEach(async () => {
    applicationTypeService = createMock<ApplicationTypeService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationTypeController, ApplicationProfile],
      providers: [
        {
          provide: ApplicationTypeService,
          useValue: applicationTypeService,
        },
        {
          provide: ApplicationDecisionMakerService,
          useValue: createMock<ApplicationDecisionMakerService>(),
        },
        {
          provide: ApplicationStatusService,
          useValue: createMock<ApplicationStatusService>(),
        },
      ],
    }).compile();

    controller = module.get<ApplicationTypeController>(
      ApplicationTypeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should getall', async () => {
    const result: ApplicationTypeDto[] = [applicationStatusDto];

    applicationTypeService.getAll.mockResolvedValue([
      {
        ...applicationStatusDto,
        auditCreatedAt: 0,
        auditCreatedBy: '',
        auditUpdatedAt: 0,
        auditUpdatedBy: '',
        uuid: '',
      } as any as ApplicationType,
    ]);

    expect(await controller.getAll()).toEqual(result);
  });
});
