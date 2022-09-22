import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationService } from '../application.service';
import { ApplicationSubtaskType } from './application-subtask-type.entity';
import { ApplicationSubtaskController } from './application-subtask.controller';
import { CardSubtask } from './application-subtask.entity';
import { ApplicationSubtaskService } from './application-subtask.service';

describe('ApplicationSubtaskController', () => {
  let controller: ApplicationSubtaskController;
  let mockSubtaskService: DeepMocked<ApplicationSubtaskService>;
  let applicationService: DeepMocked<ApplicationService>;

  const mockSubtask: Partial<CardSubtask> = {
    uuid: 'fake-uuid',
    createdAt: new Date(1662762964667),
    type: {
      backgroundColor: 'back-color',
      textColor: 'text-color',
    } as ApplicationSubtaskType,
  };

  beforeEach(async () => {
    mockSubtaskService = createMock<ApplicationSubtaskService>();
    applicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationSubtaskController],
      providers: [
        {
          provide: ApplicationSubtaskService,
          useValue: mockSubtaskService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        ApplicationSubtaskProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationSubtaskController>(
      ApplicationSubtaskController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the service and map to dto for create', async () => {
    mockSubtaskService.create.mockResolvedValue(mockSubtask as CardSubtask);

    const res = await controller.create('mock-file', 'mock-type');

    expect(mockSubtaskService.create).toHaveBeenCalled();

    expect(res.backgroundColor).toEqual(mockSubtask.type.backgroundColor);
    expect(res.textColor).toEqual(mockSubtask.type.textColor);
    expect(res.createdAt).toEqual(mockSubtask.createdAt.getTime());
  });

  it('should return the new entity for update', async () => {
    const completionDate = new Date(1662762964677);
    mockSubtaskService.update.mockResolvedValue({
      ...mockSubtask,
      completedAt: completionDate,
    } as CardSubtask);

    const res = await controller.update(mockSubtask.uuid, {
      completedAt: 1662762964677,
    });

    expect(mockSubtaskService.update).toHaveBeenCalled();
    expect(res.completedAt).toEqual(completionDate.getTime());
  });

  it('should call through for delete', async () => {
    mockSubtaskService.delete.mockResolvedValue();

    await controller.delete(mockSubtask.uuid);

    expect(mockSubtaskService.delete).toHaveBeenCalled();
    expect(mockSubtaskService.delete.mock.calls[0][0]).toEqual(
      mockSubtask.uuid,
    );
  });
});
