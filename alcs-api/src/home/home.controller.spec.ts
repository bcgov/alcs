import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../application/application.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { CardSubtaskType } from '../card/card-subtask/card-subtask-type/card-subtask-type.entity';
import { CardSubtask } from '../card/card-subtask/card-subtask.entity';
import { CardSubtaskService } from '../card/card-subtask/card-subtask.service';
import { CodeService } from '../code/code.service';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import {
  initApplicationMockEntity,
  initApplicationReconsiderationMockEntity,
} from '../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { HomeController } from './home.controller';

describe('HomeController', () => {
  let controller: HomeController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationSubtaskService: DeepMocked<CardSubtaskService>;
  let mockApplicationReconsiderationService: DeepMocked<ApplicationReconsiderationService>;

  const mockSubtask: Partial<CardSubtask> = {
    uuid: 'fake-uuid',
    createdAt: new Date(1662762964667),
    type: {
      type: 'fake-type',
      backgroundColor: 'back-color',
      textColor: 'text-color',
    } as CardSubtaskType,
  };

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationSubtaskService = createMock<CardSubtaskService>();
    mockApplicationReconsiderationService =
      createMock<ApplicationReconsiderationService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [HomeController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CardSubtaskService,
          useValue: mockApplicationSubtaskService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockApplicationReconsiderationService,
        },
        ApplicationProfile,
        ApplicationSubtaskProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);

    mockApplicationService.getAll.mockResolvedValue([]);
    mockApplicationService.mapToDtos.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call ApplicationService with the correct filter for assigned', async () => {
    const userId = 'fake-user-id';
    await controller.getAssignedToMe({
      user: {
        entity: {
          uuid: userId,
        },
      },
    });
    expect(mockApplicationService.getAll).toHaveBeenCalled();
    expect(mockApplicationService.getAll.mock.calls[0][0]).toEqual({
      card: {
        assigneeUuid: userId,
      },
    });
  });

  it('should call ApplicationService and map the types back for type', async () => {
    const mockApplication = initApplicationMockEntity();
    mockApplicationService.getAllApplicationsWithIncompleteSubtasks.mockResolvedValue(
      [{ ...mockApplication } as Application],
    );
    mockApplicationReconsiderationService.getSubtasks.mockResolvedValue([
      {
        ...initApplicationReconsiderationMockEntity(),
      } as ApplicationReconsideration,
    ]);

    mockApplicationService.mapToDtos.mockResolvedValue([
      mockApplication as any as ApplicationDto,
    ]);
    mockApplicationReconsiderationService.mapToDtos.mockResolvedValue([
      mockApplication.reconsiderations[0] as any,
    ]);

    const res = await controller.getIncompleteSubtasksByType();

    expect(res.length).toEqual(2);
    expect(mockApplicationService.mapToDtos).toHaveBeenCalled();
    expect(
      mockApplicationService.getAllApplicationsWithIncompleteSubtasks,
    ).toBeCalledTimes(1);
    expect(mockApplicationReconsiderationService.getSubtasks).toBeCalledTimes(
      1,
    );
    expect(res[0].type).toEqual(mockSubtask.type.type);
    expect(res[0].application).toEqual(mockApplication);
  });
});
