import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationService } from '../application/application.service';
import { ApplicationGrpcController } from './alcs-application.controller';

describe('ApplicationGrpcController', () => {
  let controller: ApplicationGrpcController;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        { provide: ApplicationService, useValue: mockApplicationService },
        {
          provide: ClsService,
          useValue: {},
        },

        ...mockKeyCloakProviders,
      ],
      controllers: [ApplicationGrpcController],
    }).compile();

    controller = module.get<ApplicationGrpcController>(
      ApplicationGrpcController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service on generateNumber', async () => {
    const fileNumber = 'file-id';
    mockApplicationService.generateNextFileNumber.mockResolvedValue(fileNumber);
    const res = await controller.generateFileNumber({
      ApplicationFileNumberGenerateGrpcRequest: {},
    });

    expect(res).toEqual({ fileNumber });
    expect(mockApplicationService.generateNextFileNumber).toBeCalledTimes(1);
  });
});
