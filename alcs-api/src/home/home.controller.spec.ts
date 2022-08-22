import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationService } from '../application/application.service';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { HomeController } from './home.controller';

describe('HomeController', () => {
  let controller: HomeController;
  let mockApplicationService;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
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

  it('should call ApplicationService with the correct filter', async () => {
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
      assigneeUuid: userId,
    });
  });
});
